from rdflib import Graph
g = Graph().parse('./file.txt', format='ttl')

print(g.serialize(format='json-ld'))