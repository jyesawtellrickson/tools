#  -*- coding: utf-8 -*-

"""Foodline Homepage Parser

Script to parse Foodline page for orders, info includes:
    - Vendor
    - Catering (or Tingkat)
    - Date for
    - Time placed (approx.)
    - Time scanned
Data is pickled in a pandas dataframe as well as
being saved as a csv.

Note you should scan multiple times within an hour as the
results are sometimes different.
"""

import urllib.request
import bs4
import requests
import pandas as pd
import pickle as pkl
from datetime import datetime
from datetime import timedelta
from os import listdir
from os.path import isfile, join
import os
import sys

def remove_t(text):
    text = text.replace("\t", "")
    text = text.replace("\n", "")
    return text

def link_to_vendor(link):
    end = link.rfind('/', 0, len(link)-1)
    start = link.rfind('/', 0, end-1)+1
    vendor = link[start:end]
    return vendor


def link_to_order(link):
    end = link.rfind('/', 0, len(link))
    start = link.rfind('/', 0, end-1)+1
    order = link[start:end]
    return order

def cust_to_catering(cust):
    start = cust.find('placed a ') + 9
    end = cust.find(' order')
    catering = cust[start:end]
    return catering


def link_to_catering(link):
    if link[1] == "c":
        catering = "catering"
    else:
        catering = "tingkat"
    return catering


def cust_to_people(cust):
    start = cust.find('of ') + 3
    end = cust.find(' pax')
    if start == 2:
        people = None
    else:
        people = int(cust[start:end])
    return people

def cust_to_people_2(cust):
    end = cust.find(' pax')
    if end > 0:
        people = int(cust[0:end])
    else:
        people = None
    return people


def cust_to_delivery(cust):
    # split up depending if it is short or long form
    start = cust.find('from ') + 5
    if start != 4:
        date_str = cust[start:]
        if len(date_str) == 7:
            date_str = date_str[0]+date_str[3:]
        else:
            date_str = date_str[:2]+date_str[4:]
        delivery = datetime.strptime(date_str, '%d %b')
    else:
        start = cust.find('for ') + 4
        date_str = cust[start:]
        if date_str.find(",") == 7:
            date_str = date_str[0]+date_str[3:]
        else:
            date_str = date_str[:2]+date_str[4:]
        delivery = datetime.strptime(date_str, '%d %b, %I:%M%p')
    delivery = delivery.replace(year=2016)
    return delivery

def is_number(s):
    try:
        float(s)
        return True
    except ValueError:
        return False

def cust_to_delivery_2(cust):
    # split up depending if it is short or long form
    start = cust.find('for ') + 4
    if start != 3:
        date_str = cust[start:]
        if start == len(cust):
            return None
        if not is_number(date_str[0]):
            return None
        if not is_number(date_str[1]):
            date_str = date_str[0]+date_str[3:7]
        else:
            date_str = date_str[:2]+date_str[4:8]
        delivery = datetime.strptime(date_str, '%d %b')
    else:
        start = cust.find('for ') + 4
        date_str = cust[start:]
        if date_str.find(",") == 7:
            date_str = date_str[0]+date_str[3:]
        else:
            date_str = date_str[:2]+date_str[4:]
        delivery = datetime.strptime(date_str, '%d %b, %I:%M%p')
    delivery = delivery.replace(year=2017)
    return delivery


def time_to_order(time, time_scanned):
    time_searches = ['', ' sec', ' min', ' hour', ' few hours']
    time_find = -1
    # first trim down to remove order or ordered
    if len(time) == 0:
        return ""
    while time_find == -1:
        time_find = time.find(time_searches.pop())
    if len(time_searches) != 0 and len(time_searches) != 4:
        time_num = int(time[0:time_find])
    if len(time_searches) == 0:
        order_date = time_scanned - timedelta(hours=5)
    elif len(time_searches) == 1:
        order_date = time_scanned - timedelta(seconds=time_num)
    elif len(time_searches) == 2:
        order_date = time_scanned - timedelta(minutes=time_num)
    elif len(time_searches) == 3:
        order_date = time_scanned - timedelta(hours=time_num)
    elif len(time_searches) == 4:
        order_date = time_scanned - timedelta(hours=3)
    return order_date


def get_files(mypath):
    # find all files in the folder
    files = [f for f in listdir(mypath) if isfile(join(mypath, f))]
    return files


"""

    Main Script

"""

top_path = os.getcwd()

mypath = top_path + "/foodline/"

files = get_files(mypath)

for f in files[:]:
    orders = pd.read_csv(top_path + '/orders.csv', encoding='utf-8', index_col=0, sep=",")
    # open the file
    openFile = open(mypath + f, encoding='iso-8859-1') #'utf-8')
    content = openFile.read()# .decode('utf-8', 'ignore')
    # process with bs4
    homeSoup = bs4.BeautifulSoup(openFile, 'html.parser')
    # close the file
    openFile.close()
    # get time scanned from file name
    time_scanned = datetime.strptime(f[9:19], '%y%m%d%H%M')
    # get card elements
    containers = homeSoup.find_all('div', attrs={'class':'CellContainer'})
    orders_len = orders.shape[0]
    # iterate over each card containing an order
    for i, container in enumerate(containers):
        cells = container.find_all('div', attrs={'class':'Cell'})
        # get link
        link = cells[0].a['href']
        order = link_to_order(link)
        cell_divs = cells[1].find_all('div')
        # collect parameters
        cust = cell_divs[0].get_text()
        time = cell_divs[1].get_text()
        cust = remove_t(cust)
        # apply functions to raw data
        catering = link_to_catering(link)
        people = cust_to_people_2(cust)
        delivery_date = cust_to_delivery_2(cust)
        vendor = link_to_vendor(link)
        order_date = time_to_order(time, time_scanned)
        raw = link + " --- " + order + " --- " + cust + " --- " + time
        # before adding results to file, check if the order already exists
        # if order with same delivery date, same order and vendor AND time is within 1 hour, delete
        do_not_add = False
        # alternatively, just check if order was in last 30 minutes
        if order_date < time_scanned - timedelta(minutes=30):
            do_not_add = True
        if do_not_add == False:
            for j in range(orders_len-50, orders_len):
                if str(delivery_date) == orders.loc[j, 'delivery_date'] and \
                                order == orders.loc[j, 'order'] and \
                                vendor == orders.loc[j, 'vendor'] and \
                        (people == orders.loc[j, 'people'] or people is None):
                    # time_diff = order_date-datetime.strptime(orders.loc[j, 'order_date'], "%Y-%m-%d %H:%M:%S.%f")
                    # if abs(time_diff.seconds) < 3*60*60:
                    # no need to add
                    do_not_add = True
                    # print("Result omitted.")
                    break
                if len(cell_divs) < 2 and order == orders.loc[j, 'order'] and j >= 20:
                    do_not_add = True
                    break
        # if passed checks of last 50 orders, proceed
        if do_not_add == False:
            # add results to file
            # can we create an ID with a trick and then check against orders
            data = [order, vendor, catering, people, delivery_date, order_date, time_scanned, raw]
            orders.loc[orders_len] = data
            orders_len += 1
            print("Result added: ", order, people, order_date)
    # dump completed output to caterers pickle file
    pkl.dump(orders, open(top_path+"/orders.p", "wb"))
    # also send to csv
    orders.to_csv(top_path+"/orders.csv", encoding='utf-8')
    # move file to processed
    os.rename(mypath+f, mypath+"processed/"+f)

print("script run successfully")
