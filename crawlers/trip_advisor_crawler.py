"""
    Script to scrape TripAdvisor website for restaurant info
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

# process each country seperately
# define dataframe
restaurants = pd.DataFrame(columns=['name'])
# define base website address and search address
base_search = 'https://en.tripadvisor.com.hk/Restaurants-g294217-Hong_Kong.html'
# now iterate through pages to deal with infinite scroll
# default is set to 10 but this may need to be adjusted
for i in range(10):
    print("Processing Page: "+str(i+1))
    page = requests.get(base_search+str(i+1))
    # convert to soup
    homeSoup = bs4.BeautifulSoup(page.text)
    # get card elements
    elems = homeSoup.select('.card-header-left')
    # check where to add to new section
    start_p = restaurants.shape[0]
    # iterate through elements
    for j, elem in enumerate(elems):
        # get tag as string
        name = elem.a.getText()
        tag = str(elem.p)[3:-4]
        temp = str(elem.a).find(">")
        link = str(elem.a)[9:temp-1]
        restaurants.loc[start_p+j] = [name, tag, link]
# dump completed output to caterers pickle file
pkl.dump(restaurants, open("restaurants.p", "wb"))
# also send to csv
restaurants.to_csv("restaurants_.csv", encoding='utf-8')
print("Complete.")
