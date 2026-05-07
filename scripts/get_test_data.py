import random

I_END = 15
start = 1940

string = ""

for i in range(I_END):
    id = random.randint(10, 100000)
    string += f"\"{id}\"{', ' if i < I_END - 1 else ''}"
    start += 10

print(string)