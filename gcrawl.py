# coding: utf-8
# 完整版!!!
"""
Post the query to Google　Search and get the return results
"""
import sys 
import json
import re
import time
from itertools import product
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.chrome.options import Options



# Browser settings
chrome_options = Options()
chrome_options.add_argument('--incognito')
chrome_options.add_argument('user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10.14; rv:65.0) Gecko/20100101 Firefox/65.0')
browser = webdriver.Chrome(chrome_options=chrome_options)

# Keyword combination
'''
keyword = list(product('ABC', 'xyz'))
for a in keyword:
    query
'''

# Query settings
query = '臺北市有什麽好吃的'
browser.get('https://www.google.com/search?q={0}'.format(query))
next_page_times = 2


# Crawler
for _page in range(next_page_times):
    soup = BeautifulSoup(browser.page_source, 'html.parser')
    content = soup.prettify()
    
    #測試有沒有被google ban掉
    #page = re.findall('<div id="result-stats">\n\ +(.+)', content)
    #print(page)
    # Get titles and urls
    '''
    只存取文字，其他的標頭刪掉
    https://t.codebug.vip/questions-1903347.htm
    '''
   
     
    #urls = [elem.text for elem in soup.find_all("div",class_="yuRUbf")]
    #test = browser.find_elements_by_class_name('yuRUbf')
  
    titles = [elem.text for elem in soup.find_all("h3", class_="LC20lb DKV0Md")]
    '''
    用browser.find_elements_by_class_name('yuRUbf')是存成陣列，如果直接get()會出現陣列不能get()
    所以要用下面兩行，來抓取裡面的href
    https://stackoverflow.com/questions/54862426/python-selenium-get-href-value/54862902
    '''
    elems = browser.find_elements_by_css_selector(".yuRUbf [href]")
    links = [elem.get_attribute('href') for elem in elems]
    #簡介
    shorts= [elem.text for elem in soup.find_all("div", class_="IsZvec")]
    
    for n in range(min(len(titles), len(links))):    
        print(titles[n],links[n],shorts[n],sep = '\n')
        print("\n")
    
    # Wait
    time.sleep(30)

    # Turn to the next page
    try:
        browser.find_element_by_link_text('下一頁').click()
    except:
        print('Search Early Stopping.')
        browser.close()
        exit()
    

# Close the browser
browser.close()

result = {
    titles,
    elems,
    links,
    shorts
  }

json = json.dumps(result)

print(str(json))
sys.stdout.flush()