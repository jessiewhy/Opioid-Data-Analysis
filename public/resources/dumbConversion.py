import csv
import json

useful = {}
with open ('converter.json','r') as converter:
    convert = json.load(converter)
    for entry in convert:
        useful[entry['abbreviation']] = entry['name']

with open ('cleanedstateOpioids.csv', 'w') as clean:
    cleaned = csv.writer(clean, delimiter=',')
    with open('stateOpioids.csv') as csv_file:
        csv_reader = csv.reader(csv_file, delimiter=',')
        for row in csv_reader:
            cleaned.writerow([useful[row[0]], row[1]])

