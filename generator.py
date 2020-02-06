import random
import json

ROWS = 5
STATES = ["AL", "AK", "AS", "AZ", "AR", "CA", "CO", "CT", "DE", "DC", "FM", "FL", "GA", "GU", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MH", "MD", "MA", "MI", "MN", "MS",
          "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "MP", "OH", "OK", "OR", "PW", "PA", "PR", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VI", "VA", "WA", "WV", "WI", "WY"]
F_NAMES = ['Gillan', 'Viv', 'Ketty', 'Cheryl', 'Cherin', 'Etti', 'Adriana', 'Jaquelyn', 'Elie', 'Wilhelmine', 'Mellie', 'Emelita', 'Van', 'Aeriela', 'Malva', 'Alvira', 'Heloise', 'Claire', 'Candide', 'Rowe', 'Em', 'Rachel', 'Denna', 'Alis', 'Lavena', 'Brynn', 'Beret', 'Mirabelle', 'Rae', 'Rosalia', 'Luella', 'Christalle', 'Darelle', 'Chrysa', 'Kyrstin', 'Odelinda', 'Brigida', 'Georgianna', 'Myra', 'Lucina', 'Jemie', 'Matty', 'Vannie', 'Janelle', 'Ibby', 'Cathe', 'Lorne', 'Tabbitha', 'Ora', 'Bella', 'Pammi', 'Bobina', 'Mandie', 'Zia', 'Agathe', 'Belicia', 'Sharlene', 'Sonny', 'Suzette', 'Lynnett', 'Judye', 'Gaby', 'Aurelie', 'Reina', 'Gertie', 'Iolanthe', 'Rana', 'Karlotta', 'Modestia', 'Gae', 'Lorie', 'Rebecca', 'Lynda', 'Bennie', 'Saundra', 'Rois', 'Tani', 'Julie', 'Anne-Corinne', 'Alvina', 'Remy', 'Janella', 'Ainsley', 'Karon', 'Berthe', 'Wallis', 'Katina', 'Austine', 'Anthea', 'Gwenny', 'Kimbra', 'Drusie', 'Daron', 'Raina', 'Anni', 'Marillin', 'Imojean', 'Kitty', 'Beitris', 'Katrinka',
           'Madlin', 'Grata', 'Odelle', 'Loella', 'Brina', 'Mada', 'Linnea', 'Tildie', 'Riva', 'Codee', 'Wendie', 'Rebbecca', 'Bevvy', 'Sarene', 'Binni', 'Nadean', 'Ailina', 'Sydelle', 'Dulcinea', 'Saloma', 'Abigael', 'Emyle', 'Riane', 'Thomasine', 'Cristin', 'Winifred', 'Sisely', 'Josey', 'Corilla', 'Rosene', 'Elladine', 'Betti', 'Liza', 'Gipsy', 'Nicolle', 'Lucilia', 'Aimee', 'Louise', 'Adelaide', 'Madelaine', 'Venita', 'Margo', 'Bree', 'Bellanca', 'Deina', 'Toby', 'Henka', 'Jany', 'Kari', 'Carmita', 'Velma', 'Alexandrina', 'Keslie', 'Vikki', 'Ladonna', 'Retha', 'Minnie', 'Tobi', 'Florida', 'Rubie', 'Shirlene', 'Ebonee', 'Brier', 'Teresita', 'Christiane', 'Essy', 'Elfie', 'Hulda', 'Mathilda', 'Irma', 'Anna-Diane', 'Edythe', 'Val', 'Josephine', 'Celle', 'Lydia', 'Vickie', 'Cassandre', 'Jamima', 'Catie', 'Caron', 'Claudetta', 'Celia', 'Jeanette', 'Ambur', 'Katusha', 'Gabriell', 'Ajay', 'Gertrude', 'Jermaine', 'Celene', 'Vikky', 'Willi', 'Corri', 'Robena', 'Isabella', 'Leilah', 'Linea', 'Dot', 'Dalenna']
L_NAMES = ['Little', 'Hicks', 'Austin', 'Simpson', 'Peters', 'Guzman', 'Becker', 'Burnett', 'Patel', 'Webster', 'Potter', 'Rios', 'Sims', 'Stokes', 'Sanders', 'Vega', 'Delgado', 'Drake', 'Nelson', 'Chang', 'Jensen', 'Gomez', 'Davidson', 'Schroeder', 'Ortiz', 'Henry', 'Daniels', 'Mueller', 'Jennings', 'Rojas', 'Cox', 'Ball', 'Bauer', 'Hodges', 'Strickland', 'Weiss', 'Summers', 'Sherman', 'Hogan', 'Caldwell', 'Foster', 'Ward', 'Erickson', 'Vargas', 'Hall', 'Hood', 'Shields', 'Jenkins', 'Schmidt', 'Wagner', 'Avila', 'Bush', 'Warner', 'Ford', 'Atkins', 'Jacobs', 'Burke', 'Wells', 'Mcdaniel', 'Allen', 'Ochoa', 'Matthews', 'Douglas', 'Mejia', 'Glenn', 'Collier', 'Goodman', 'Navarro', 'Johnson', 'Kelley', 'Gallagher', 'French', 'Zimmerman', 'Colon', 'Garcia', 'Hunt', 'Vincent', 'Serrano', 'Melton', 'Foley', 'Salinas', 'Bennett', 'Brooks', 'Day', 'Mullins', 'Guerra', 'Pham', 'Curtis', 'Griffith', 'Ingram', 'Roy', 'Mccoy', 'Elliott', 'Garrison', 'Swanson', 'Perry', 'Robles', 'Cunningham', 'Jackson', 'Barnes',
           'Walker', 'Velasquez', 'Fuentes', 'Watts', 'Hart', 'Willis', 'Mathews', 'Lynch', 'Glover', 'Harris', 'Griffin', 'Combs', 'Walsh', 'Bradley', 'Wolfe', 'Deleon', 'Long', 'Rivas', 'Lopez', 'Gardner', 'Singh', 'Robertson', 'Nichols', 'Thompson', 'Ross', 'Hunter', 'Craig', 'Saunders', 'Larsen', 'Lambert', 'Moss', 'Christian', 'Mitchell', 'Whitaker', 'Wood', 'Richards', 'James', 'Palmer', 'Li', 'Bass', 'Moran', 'Parsons', 'Hill', 'King', 'Jordan', 'Fischer', 'Valencia', 'Snyder', 'Rodgers', 'Simmons', 'Aguirre', 'Wilcox', 'Rose', 'Trevino', 'Cooper', 'Wise', 'Trujillo', 'Hammond', 'Murphy', 'Sparks', 'Reed', 'Horn', 'Copeland', 'Howell', 'Higgins', 'Richardson', 'Soto', 'Parker', 'Graham', 'May', 'Mclaughlin', 'Horton', 'Blake', 'Mathis', 'Guerrero', 'Gross', 'Carroll', 'Munoz', 'Pierce', 'Bond', 'Carpenter', 'Houston', 'Watkins', 'Mendez', 'Campos', 'Davenport', 'Jimenez', 'Lindsey', 'Lang', 'Conner', 'Armstrong', 'Schwartz', 'Fitzgerald', 'Goodwin', 'Olsen', 'Boone', 'Johnston', 'Schneider', 'Cobb', 'Graves']

COLUMNS = [
    {
        'name': 'First Name',
        'key': 'fn',
        'generator': lambda: random.choice(F_NAMES)
    },
    {
        'name': 'Last Name',
        'key': 'ln',
        'generator': lambda: random.choice(L_NAMES)
    },
    {
        'name': 'ID',
        'key': 'id',
        'generator': lambda: random.randrange(1000000, 30000000)
    },
    {
        'name': 'State',
        'key': 'st',
        'generator': lambda: random.choice(STATES)
    }
]

data = [{column['key']:column['generator']() for column in COLUMNS} for i in range(ROWS)]
with open('data.json', 'w') as file:
    file.write(json.dumps(data))
