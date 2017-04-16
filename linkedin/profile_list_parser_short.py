#####
#
#
#
import bs4
import json
import pandas as pd
import requests
import re
#
#
def get_domain(company):
    return domain_from_url(url_from_page(query_duck_duck_go(company)))

def split_occ_title(occ):
    if occ is None:
        return None
    else:
        # check if company there
        if occ.find("at") != -1:
            return occ[:occ.find("at")-1]
        else:
            return occ
    return


def split_occ_company(occ):
    # check if company there
    if occ.find("at") != -1:
        return occ[occ.find("at")+3:]
    else:
        return None
    return

def domain_from_url(url):
    if url is not None:
        url = re.sub("www.","",url)
        url = re.sub("https?://","",url)
    return url

def url_from_page(page):
    try:
        results = page.json()['Results']
        if 'FirstURL' in results[0].keys():
            return results[0]['FirstURL']
        else:
            return None
    except:
        print("No Results found")
        return None


def query_duck_duck_go(query):
    if query is not None:
        # clean query to make url compliant
        query = re.sub(" ","+",query)
        # final query
        final = "http://api.duckduckgo.com/?q="+query+"&format=json"
        # get page
        ans = requests.get(final)
        return ans
    return None

# open file
file = open("office_manager_3.html", encoding='utf-8')
# convert to soup
soup = bs4.BeautifulSoup(file)
# find code sections which contain json required
codes = soup.find_all("code")
# sort through to find correct json
# correct json has firstName somewhere
for code in codes:
    code_info = {'firstName':0, 'lastName':0, 'occupation':0}
    try:
        code_json = json.loads(code.get_text())
        code_incl = code_json['included']
        # check exists firstName
        for incl in code_incl:
            if 'firstName' in incl.keys():
                code_info['firstName'] += 1
            if 'lastName' in incl.keys():
                code_info['lastName'] += 1
            if 'occupation' in incl.keys():
                code_info['occupation'] += 1
    except:
        1
    if code_info['firstName'] > 0:
        final_code = code

if final_code is None:
    print("Couldn't find data")
# correct code found, now find the fields which have the user name
code_json = json.loads(final_code.get_text())['included']
# data should be list of lists
customers = []
# iterate
for incl in code_incl:
    tmp = []
    if 'firstName' in incl.keys():
        tmp.append(incl['firstName'])
    else:
        tmp.append('')
    if 'lastName' in incl.keys():
        tmp.append(incl['lastName'])
    else:
        tmp.append('')
    if 'occupation' in incl.keys():
        tmp.append(incl['occupation'])
    else:
        tmp.append('')
    if tmp != ['', '', '']:
        customers.append(tmp)

# extra job part must come from annotations
# ...can't see the link on how to build

headers = ['firstName', 'lastName', 'occupation']
# convert to dataframe
customers_df = pd.DataFrame(customers, columns=headers)

customers_df['company'] = customers_df['occupation'].apply(split_occ_company)
customers_df['title'] = customers_df['occupation'].apply(split_occ_title)

customers_df['domain'] = customers_df['company'].apply(get_domain)


print(customers_df)

