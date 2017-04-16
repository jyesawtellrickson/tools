"""
    Script can be used to check a list of emails exists.
    It will ping the server and return "y" if verified
    and "n" if it failed for one of many reasons.
"""

import re
import pandas as pd
import dns.resolver
import socket
import smtplib

customers_df = pd.read_csv("linkedin_profiles.csv", encoding='utf-8')
try:
    tmp = customers_df['verified'][0]
except:
    customers_df['verified'] = None

try:
    tmp = customers_df['final_email'][0]
except:
    customers_df['final_email'] = None

for i in range(0, 1): #customers_df.shape[0]):
    # check name and domain are there
    if customers_df['name'] is None or customers_df['domain'] is None:
        next(i)
    # connect to server
    records = dns.resolver.query(customers_df['domain'][i], 'MX')
    mxRecord = records[0].exchange
    mxRecord = str(mxRecord)

    # Get local server hostname
    host = socket.gethostname()

    # SMTP lib setup (use debug level for full output)
    server = smtplib.SMTP()
    server.set_debuglevel(0)

    # SMTP Conversation
    server.connect(mxRecord)
    server.helo(host)
    server.mail('me@domain.com')

    # get emails
    if customers_df['email'][i].find(";") != -1:
        emails = customers_df['email'][i].split(";")[:-1]
    else:
        emails = customers_df['email'][i]
    verified = False
    while verified == False and len(emails) > 0:
        addressToVerify = emails.pop()
        print(addressToVerify)
        match = re.match('^[_a-z0-9-]+(\.[_a-z0-9-]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,4})$', addressToVerify)
        if match == None:
            print('Bad Syntax')
            next()
            # raise ValueError('Bad Syntax')
        code, message = server.rcpt(str(addressToVerify))
        if code == 250:
            print('Success')
            verified = True
    server.quit()
    if verified == True:
        customers_df['verified'][i] = "y"
        customers_df['final_email'][i] = addressToVerify
    else:
        customers_df['verified'][i] = "n"

customers_df.to_csv('linkedin_profiles_checked.csv')
