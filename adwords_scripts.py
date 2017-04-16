"""
    Contains various scripts used for automating Adwords procedures.
"""

import pandas as pd
from tkinter import *
from tkinter import ttk
import pickle


def read_sheet(adwords_spreadsheet,):
    # pd.read_csv(adwords_spreadsheet, encoding='utf-8', index_col=0)
    sheet = pd.read_csv(adwords_spreadsheet, encoding='utf-8', header=True)
    # clean out totals row
    try:
        sheet = sheet.loc[sheet['Ad state'] != 'Total']
        sheet = sheet.loc[sheet['Ad state'] != 'Total - filtered']
    except KeyError:
        sheet = sheet.loc[sheet['Keyword state'] != 'Total']
        sheet = sheet.loc[sheet['Keyword state'] != 'Total - filtered']
    return sheet


def save_sheet(df, name):
    df.to_csv(name, encoding='utf-8', index=False)
    return 1


def get_caterer_info():
    caterers_hk = pickle.load('caterers_hk.p')
    caterers_sg = pickle.load('caterers_sg.p')
    return caterers_hk, caterers_sg


def modifyAds(input_csv):
    # read in data
    input_data = read_sheet(input_csv)
    # get input from user
    heading = input("Heading: ")
    desc1 = input("Description 1: ")
    desc2 = input("Description 2: ")
    # produce new ads
    test_data = input_data.copy()
    if heading != '':
        test_data['Ad'] = heading
    if desc1 != '':
        test_data['Description line 1'] = desc1
    if desc2 != '':
        test_data['Description line 2'] = desc2
    test_data['Ad ID'] = ''
    output = pd.concat([input_data, test_data])
    save_sheet(output, 'new_ads.csv')
    return 1

def create_ads_user(input_csv):
    """
    Function reads in data from input_csv and then
    generates new ads.

    :param input_csv:
    :return: new ads saved to new_ads.csv
    """
    # read in ad groups
    input_data = read_sheet(input_csv)
    cols = input_data.columns
    cols.remove('Ad')
    input_data.drop(input_data.columns)
    # get input from user
    output = pd.DataFrame()

    heading = input("Heading: ")
    desc1 = input("Description 1: ")
    desc2 = input("Description 2: ")
    # produce new ads
    testData = input_data.copy()
    testData['Ad'] = heading
    testData['Description line 1'] = desc1
    testData['Description line 2'] = desc2
    output['Ad'] = heading
    output = pd.concat([input_data,testData])
    save_sheet(output,'new_ads.csv')
    return 1


def adInput():

    root = Tk()
    root.title("Input for Ad")

    mainframe = ttk.Frame(root, padding="3 3 12 12")
    mainframe.grid(column=0, row=0, sticky=(N, W, E, S))
    mainframe.columnconfigure(0, weight=1)
    mainframe.rowconfigure(0, weight=1)

    heading = StringVar()
    desc1 = StringVar()
    desc2 = StringVar()

    heading_entry = ttk.Entry(mainframe, width=7, textvariable=heading)
    heading_entry.grid(column=2, row=1, sticky=(W, E))
    desc1_entry = ttk.Entry(mainframe, width=7, textvariable=desc1)
    desc1_entry.grid(column=2, row=2, sticky=(W, E))
    desc2_entry = ttk.Entry(mainframe, width=7, textvariable=desc2)
    desc2_entry.grid(column=2, row=3, sticky=(W, E))

    ttk.Label(mainframe, textvariable=heading).grid(column=2, row=1, sticky=(W, E))
    ttk.Label(mainframe, textvariable=desc1).grid(column=2, row=2, sticky=(W, E))
    ttk.Label(mainframe, textvariable=desc2).grid(column=2, row=3, sticky=(W, E))

    ttk.Label(mainframe, text="Heading:").grid(column=1, row=1, sticky=E)
    ttk.Label(mainframe, text="Description line 1:").grid(column=1, row=2, sticky=E)
    ttk.Label(mainframe, text="Description line 2:").grid(column=1, row=3, sticky=E)

    for child in mainframe.winfo_children(): child.grid_configure(padx=5, pady=5)

    heading.focus()
    root.bind('<Return>', calculate)

    root.mainloop()


def generate_ads(ad_group, desc, URL, campaign, cc):
    """

    :return:
    """
    base = ['' for j in range(0, 10)]
    base[0] = 'enabled'
    base[5] = URL
    base[6] = ad_group
    base[8] = campaign
    base[9] = "Text ad"
    # fill in ad creatives
    # 25 characters for HK
    push_line = False
    if len(ad_group) <= 9:
        ad = ad_group + " - Catering Menu"
    elif len(ad_group) <= 14:
        ad = ad_group + " - Catering"
    else:
        ad = ad_group
        push_line = True
    base[1] = ad
    # 35 characters for HK
    # get description text
    if len(desc) <= 25:
        desc_text = desc
    else:
        desc_text = desc[0:25]
    # update this in base
    if push_line == True:
        base[2] = "Catering Menu!"
        base[3] = desc_text
    else:
        base[2] = desc_text
        base[3] = "Browse the menu & order online"
    # 35 characters for HK
    if len(ad_group) > 22:
        base[4] = "CaterSpot." + cc + "/" + ad_group.replace(" ", "_")[0:22]
    else:
        base[4] = "CaterSpot." + cc + "/" + ad_group.replace(" ", "_")
    return pd.DataFrame(base)


def keyword_generator(campaign, ad_group):
    """
    Generate new keywords for an ad group.
    Required inputs are: Keyword state, Keyword, Match type,
                         Campaign, Ad group, Max. CPC
    :param campaign, ad_group:
    :return:
    """
    # create all new rows in a list for rows of csv
    new_keywords = []
    # define new styles desired
    new_terms = ['menu', 'catering', 'group food', 'bulk order', 'party food', 'lunch packs']
    # what about country specific?
    # define cpc of each term
    cpc_by_term = [0.5, 1.5, 1.5, 1.5, 1.5, 1.5]
    # define different types of match to use
    match_types = ['Broad', 'Phrase']
    # generate a base row to ad parts to
    base = ['' for j in range(0, 7)]
    base[0] = 'enabled'
    base[3] = campaign
    base[4] = ad_group
    # iterate through match types and new terms
    for match_type in match_types:
        base[2] = match_type
        for j, term in enumerate(new_terms):
            base[5] = cpc_by_term[j]
            if match_type == 'Phrase':
                keyword = '"'+ad_group+' '+term+'"'
            elif match_type == 'Broad':
                keyword = '+'+ad_group.replace(" ", " +")+' +'+term
            else:
                keyword = ""
                print("No keyword generated")
            base[1] = keyword
            new_keywords.append(base.copy())
    # return keywords as a df
    return pd.DataFrame(new_keywords)


def keywords_from_lists(A,B):
    # generate list of keywords
    keywords = []
    for a in A:
        for b in B:
            keywords += [a+" "+b]
    return keywords



def pause_all_ads(ad_csv):
    # input ad_csv string which can then be saved
    ads = read_sheet(ad_csv)
    ads['Ad state'] = 'paused'
    save_sheet(ads, ad_csv)
    return 1


def find_caterer_tag(caterer):
    hk_caterers, sg_caterers = get_caterer_info()
    caterers = pd.concat([hk_caterers,sg_caterers])
    # for each ad group find the slogan and get it
    try:
        tag = caterers.loc[caterers['name'] == ad_group,'tag'].values
    except: # if match can't be found the name must be odd
        print("Trying to match: "+caterer)
        print("Names available: ")
        print(caterers['name'].values)
        temp = input("Match can't be found for name, what name should we try?")
        tag = caterers.loc[caterers['name'] == temp,'tag'].values
    return tag


def find_caterer_URL(caterer):
    hk_caterers, sg_caterers = get_caterer_info()
    caterers = pd.concat([hk_caterers,sg_caterers])
    # for each ad group find the slogan and get it
    try:
        tag = caterers.loc[caterers['name']==ad_group,'link'].values
    except: # if match can't be found the name must be odd
        print("Trying to match: "+caterer)
        print("Names available: ")
        print(caterers['name'].values)
        temp = input("Match can't be found for name, what name should we try?")
        tag = caterers.loc[caterers['name']==temp,'link'].values
    return tag




def add_new_caterers(new_caterers, countries):
    """
    Take new caterers as list and produce ads ready for upload.
    This requires three separate uploads: ad groups, keywords and ads.

    """
    # get template as dataframe
    ad_template = read_sheet('templates/adwords_ads.csv')
    ad_group_template = read_sheet('templates/adwords_ad_groups.csv')
    keyword_template = read_sheet('templates/adwords_keywords.csv')
    # loop through new caterers and ad ads
    for caterer in new_caterers:
        campaign = 'sg'
        campaign_ID = '123'
        ad_group = caterer
        # update keyword template
        new_keywords = keyword_generator(campaign,ad_group)
        keyword_template = pd.concat([keyword_template, new_keywords])
        # update ad_group template
        ad_group_template = pd.concat([ad_group_template,
                                       ['enabled', ad_group, '1.5', '', campaign_ID, campaign]
                                       ])
        # update ad_template
        new_ads = generate_ads(ad_group, desc, URL, campaign, cc)
        ad_template = pd.concat([ad_template, new_ads])
    # templates all updated, output all to file
    save_sheet(ad_template,)

A = ['vegetarian', 'healthy', 'vegan', 'pescatarian', 'fresh']
B = ['catering', 'group food', 'party food', 'lunch packs']

keywords = keywords_from_lists(A, B)
out = pd.DataFrame(columns=['Keyword state', 'Keyword', 'Campaign', 'Ad group', 'Max. CPC'])
for keyword in keywords:
    i = out.shape[0]+1
    out.loc[i] = ['enabled', keyword, 'Healthy_Catering_SG', 'Healthy Catering', 1.5]

out.to_csv('output.csv')
"""
ad_group_data = readSheet('Keyword report.csv')

new_keywords_data = keyword_generator(ad_group_data)

saveSheet(new_keywords_data,'new_keywords_data.csv')
"""

print("done")
