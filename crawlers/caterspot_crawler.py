"""
    Script to scrape CaterSpot website for caterer info
    for use in adwords. Data pulled includes:
        - Name
        - Tag
        - Link
    Data is pickled in a pandas dataframe as well as
    being saved as a csv.
"""

import bs4
import requests
import pandas as pd
import pickle as pkl

# define contries to scrape
countries = ['sg', 'hk']
# process each country seperately
for country in countries:
    # split into 5 pages with
    # https://www.caterspot.sg/vendors?homepage=true&&page5
    # define dataframe
    caterers = pd.DataFrame(columns=['name', 'tag', 'link'])
    # define base website address and search address
    base = 'https://www.caterspot.' + country
    base_search = base + "/vendors?homepage=true&&page="
    # now iterate through pages to deal with infinite scroll
    # default is set to 10 but this may need to be adjusted
    # can get magically by scanning number of caterers on home page
    for i in range(10):
        print("Processing Page: "+str(i+1))
        page = requests.get(base_search+str(i+1))
        # convert to soup
        homeSoup = bs4.BeautifulSoup(page.text)
        # get card elements
        elems = homeSoup.select('.card-header-left')
        # check where to add to new section
        start_p = caterers.shape[0]
        # iterate through elements
        for j, elem in enumerate(elems):
            # get tag as string
            name = elem.a.getText()
            tag = str(elem.p)[3:-4]
            temp = str(elem.a).find(">")
            link = str(elem.a)[9:temp-1]
            caterers.loc[start_p+j] = [name, tag, base+link]
    # dump completed output to caterers pickle file
    pkl.dump(caterers, open("caterers_"+country+".p", "wb"))
    # also send to csv
    caterers.to_csv("caterers_"+country+".csv", encoding='utf-8')
    print(country+" complete.")
# send final output to user
print("All countries completed.")
