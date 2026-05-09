string = """"api_key
language
include_adult
page
vote_count.gte
sort_by
primary_release_date.gte
primary_release_date.lte
with_runtime.gte
with_runtime.lte
with_genres
without_genres
without_keywords"""

string = string.lower()
string = string.replace(" ", "_")

new_list = []
start_of_line = 0
end_of_line = 0

for i in range(len(string)):
    if string[i] == "\n":
        end_of_line = i
        
        divided_string = string[(start_of_line + 1):end_of_line]
        new_list.append(divided_string)
        
        start_of_line = i

while "" in new_list:
    new_list.remove("")

# print(new_list)
print(len(new_list))

for item in new_list:
    print(f"case \"{item}\":\nbreak;\n")