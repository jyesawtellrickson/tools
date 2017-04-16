#!/usr/bin/env python
"""
    linked_full.py
    LinkedIn Page Reading Script
    ----
    This file takes pages from LinkedIn and converts to data
    for processing.

    To execute, make sure to update the title below.

"""

########### UPDATE TITLE #####################
#
position = "Event Planner"
#
##############################################
#
#
#
import bs4
import pandas as pd
import requests
import re
from os import listdir
from os.path import isfile, join
from os import getcwd


def get_domain(company):
    return domain_from_url(
        url_from_page(
            query_duck_duck_go(
                company)
        )
    )


def clean_premium(premium):
    if premium.find("Premium") != -1:
        first_name = premium.split()[0]
        tmp = [i for i in range(0, len(premium.split())) if premium.split()[i]==first_name]
        end = sum([len(i)+1 for i in premium.split()[:tmp[1]]])-1
        return premium[:end]
    else:
        return premium


def split_occ_title(occ):
    if occ is None:
        return None
    else:
        # check if company there
        if occ.find(" at ") != -1:
            return occ[:occ.find(" at ")]
        else:
            return occ


# remove current part from name
def clean_current(cur_sec):
    cur_sec = re.sub("Current:", "", cur_sec)
    cur_sec = re.sub("\n", "", cur_sec)
    return cur_sec


# get company from occupation if it exists
def split_occ_company(occ):
    # check if company there
    if occ.find(" at ") != -1:
        return occ[occ.find(" at ")+4:]
    else:
        return None
    return


# get the domain from a url
def domain_from_url(url):
    if url is not None:
        url = re.sub("www.","",url)
        url = re.sub("https?://","",url)
        url = re.sub("/","",url)
    return url


# get the url from a page
def url_from_page(page):
    try:
        results = page.json()['Results']
        if 'FirstURL' in results[0].keys():
            return results[0]['FirstURL']
        else:
            return None
    except:
        # print("No Results found")
        return None


def query_duck_duck_go(query):
    if query is not None:
        # clean query to make url compliant
        query = re.sub(" ", "+", query)
        # final query
        final = "http://api.duckduckgo.com/?q="+query+"&format=json"
        # get page
        try:
            ans = requests.get(final)
            return ans
        except:
            return None
    return None


# guess the first name from full name
def first_name(name):
    names = name.split()
    if len(names) == 2:
        return names[0]
    elif len(names) == 3:
        return names[0]+" "+names[1]
    else:
        return None


# guess the last name from full name
def last_name(name):
    names = name.split()
    if len(names) == 2:
        return names[1]
    elif len(names) == 3:
        return names[2]
    else:
        return None


# get the first part of a name
def first_part(name):
    if name is not None:
        return name.split(" ")[0]
    else:
        return None


top_path = getcwd()
# we have a local files which we can scan
mypath = top_path + "/input/" + position + "/"
# find all files in the folder
files = [f for f in listdir(mypath) if isfile(join(mypath, f))]
customers = []
files = files[:]
for f in files:
    print(f)
    # open file
    file = open(mypath + f, encoding='utf-8')
    # convert to soup
    soup = bs4.BeautifulSoup(file)
    # find code sections which contain json required
    sections = soup.find_all("div", attrs={
        'class': "search-result__info pt3 pb4 ph0"
    })
    #
    for section in sections:
        tmp = []
        tmp.append(section.a.h3.span.get_text())
        p_section = section.find_all("p")
        tmp.append(p_section[0].get_text())
        if len(p_section) > 2:
            tmp.append(p_section[2].get_text())
        else:
            tmp.append("")
        tmp.append(" ".join(f.split(".")[0].split("_")[:-1]).title())
        customers.append(tmp)
    # extra job part must come from annotations
    # ...can't see the link on how to build


headers = ['name', 'occupation_1', 'occupation_2', 'search_term']
# convert to dataframe
customers_df = pd.DataFrame(customers, columns=headers)

customers_df['occupation_2'] = customers_df['occupation_2'].apply(clean_current)

customers_df['premium'] = customers_df['name'].apply(lambda x: x.find("Premium")!=-1)
customers_df['name'] = customers_df['name'].apply(clean_premium)
customers_df['name'] = customers_df['name'].apply(lambda x: re.sub("LinkedIn Member","",x))

# get first and last name
customers_df['first_name'] = customers_df['name'].apply(first_name)
customers_df['last_name'] = customers_df['name'].apply(last_name)
customers_df['first_name_single'] = customers_df['first_name'].apply(first_part)
customers_df['last_name_single'] = customers_df['last_name'].apply(first_part)


customers_df['company_1'] = customers_df['occupation_1'].apply(split_occ_company)
customers_df['company_2'] = customers_df['occupation_2'].apply(split_occ_company)
customers_df['title_1'] = customers_df['occupation_1'].apply(split_occ_title)
customers_df['title_2'] = customers_df['occupation_2'].apply(split_occ_title)

print(sum(customers_df['name'] == "") / len(customers_df['name']))



######
#
# generate the email addresses
# currently no way to handle multiple name names
def generate_emails(name):
    names = name.lower().split()
    if len(names) > 0:
        f = names[0]
        l = names[-1]
        emails = [
            f,
            l,
            f[0]+l,
            f+l,
            f[0]+"."+l,
            f+"."+l
        ]
        return ";".join(emails)+";"
    else:
        return None

def choose_company(com1, com2):
    if com1 is not None and com2 is not None:
        return [com1, com2][+(len(com1) > len(com2))]
    elif com1 is None:
        return com2
    elif com2 is None:
        return com1
    else:
        return None

def company_to_domain(company, domain_dict):
    try:
        return domain_dict[company]
    except:
        return None

print("fetching domains...")
#customers_df['domain'] = customers_df['company_2'].apply(get_domain)
# customers_df['email'] = customers_df['name'].apply(generate_emails)

# customers_df.to_csv('linkedin_profiles.csv')
#print(customers_df)

"""
# import csv of companies / domains
domains = pd.read_csv('domains.csv', encoding='utf-8', header=0, index_col=0)
# create dictionary
domain_dict = domains.to_dict()['Domain']
domain_dict[None] = None
domain_dict[''] = None
customers_df['domain'] = None
"""
customers_df['company'] = None
customers_df['title'] = None

for i in range(0, customers_df.shape[0]):
    print(i)
    customers_df['company'][i] = choose_company(customers_df['company_1'][i], customers_df['company_2'][i])
    customers_df['title'][i] = choose_company(customers_df['title_1'][i], customers_df['title_2'][i])
    # should use a join to get domains, this is slow
    # customers_df['domain'][i] = company_to_domain(customers_df['company'][i], domain_dict)
    #if customers_df['domain'][i] is not None and customers_df['email'][i] is not None:
    #    customers_df['email'][i] = re.sub(";", "@" + str(customers_df['domain'][i]) + ";", customers_df['email'][i])
    #else:
    #    customers_df['email'][i] = None


customers_df.to_csv('output/linkedin_profiles.csv')

# hunter_df = customers_df[['first_name', 'last_name', 'domain']]
# hunter_df = hunter_df[hunter_df['domain']!=""]

# hunter_df.to_csv('hunter_upload.csv',encoding='utf-8')
