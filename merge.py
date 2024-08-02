import pandas as pd
from fuzzywuzzy import process

# Load the all_plants.csv file
all_plants_df = pd.read_csv('all_plants.csv')

# Load the vegetable_maturity.csv file
vegetable_maturity_df = pd.read_csv('vegetable_maturity.csv')

# Strip any leading or trailing whitespace from the CommonName and Vegetable columns
all_plants_df['CommonName'] = all_plants_df['CommonName'].astype(str).str.strip()
vegetable_maturity_df['Vegetable'] = vegetable_maturity_df['Vegetable'].astype(str).str.strip()

# Create a dictionary for quick lookup of the maturity information
maturity_dict = vegetable_maturity_df.set_index('Vegetable').T.to_dict('list')

# Function to get the best match for a given vegetable name
def get_best_match(name, choices, threshold=80):
    if pd.isna(name) or name == '':
        return None
    match, score = process.extractOne(name, choices)
    if score >= threshold:
        return match
    return None

# Find the best matches for each CommonName in the all_plants_df
all_plants_df['BestMatch'] = all_plants_df['CommonName'].apply(get_best_match, args=(vegetable_maturity_df['Vegetable'].tolist(),))

# Merge the dataframes based on the best matches
merged_df = pd.merge(all_plants_df, vegetable_maturity_df, left_on='BestMatch', right_on='Vegetable', how='left')

# Drop the now redundant 'Vegetable' and 'BestMatch' columns from the merged dataframe
merged_df.drop(['Vegetable', 'BestMatch'], axis=1, inplace=True)

# Save the merged dataframe to a new CSV file
merged_df.to_csv('merged_plants_with_maturity.csv', index=False)

print("Merging completed! The merged data is saved to merged_plants_with_maturity.csv.")

