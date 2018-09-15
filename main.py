import pandas as pd 
import csv 


#opiod data
opiods_file_path='/home/jessiewhy/hackmit/data/opioids.csv'
opiod_data=pd.read_csv(opiods_file_path)
opiod_data.describe()
print(opiod_data)

#overdoses
overdoses_file_path='/home/jessiewhy/hackmit/data/overdoses.csv'
overdoses_data=pd.read_csv(overdoses_file_path)
overdoses_data.describe()
print(overdoses_data)

#prescriber-info
prescriber_info_file_path='/home/jessiewhy/hackmit/data/prescriber-info.csv'
prescriber_info_data=pd.read_csv(prescriber_info_file_path)
prescriber_info_data.describe()
print(prescriber_info_data)