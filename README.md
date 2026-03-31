## Skoluppgift: Uppgift för Backend-utveckling NodeJs
Projektet skapades och utvecklades för kursen Backend-utveckling NodeJs enligt projektkraven givet för slutprojekt. 

En plattform för hantering av bokningssystem för arbetsrum/platser eller konferensrum med olika tillgänglighet beroende på användare och admin.


## Funktioner enligt projektkrav:
-Registrering och inloggning av användare/admin.
-Autentisering med JWT.
-Autentisering av roller för vissa funktioner.
-CRUD-funktioner för hantering av rum och bokningar.
-Kontroll av "tids-konflikter" vid bokning.
-Realtids notefickationer med Socket.io
-Enkel HTML för inloggningsfunktion samt ny bokning och att kunna avboka.


## Använda tekniker i projektet:
-Node.js
-Express.js
-Mongo DB Atlas
-JWT
-bcrypt
-Redis
-WebSocket


## Projektstruktur
-'server': huvud filen som startar applikationen och kopplar ihop alla delar.
-'config': konfigurera för databas, loggar och redis.
-'middleware': JWT autentiserings logik, loggning.
-'models': data modeler för Mongo DB för “User, Room och Booking.”
-'public': enkel HTML för inloggning, skapa bokning och ta bort bokning.
-'routes': API-rutter för “User, Room och Booking.”


## Instalation:
```
1.Klona repot
2.Installera dependencies med 'npm install'.
3.Skapa '.env'-fil.
4.Addera nödvändiga miljövariabler nycklar.
5.Starta projektet med 'npm run dev’.
6.Gå till 'http://localhost:4000/' för inloggning och 'http://localhost:4000/booking' för bokning i valfri browser.
```

## API-dokumentation
Users
POST'/users/register':
Skapar användare om ej admin-nyckel ges. Kollar längd och att användare med samma namn inte finns registrerade innan ny användare skapas.
Kräver JWT: Nej.
Admin: Nej.
Data som krävs i body: {
      'userNamne': 'Användar namn',
      'password': 'Lösenord',
      'adminKey':'valfritt om admin rol skall ges'
}


POST'/users/login':
Tar användarnamn och lösenord och kollar att användare med matchande användarnamn existerar samt att angivna lösenord matchar de sparade lösenord i db. Om inget fel upptäcks loggar användare in och en 'token' ges.
Kräver JWT: Nej.
Admin: Nej.
Data som krävs i body: {
      'userNamne': 'Användar namn',
      'password': 'lösenord'
}


Booking
GET'/bookings/':
Hämtar bokningar som användare har där den kollar om vilka bokningar som finns kopplat till användarens id. Skickar datan på dessa bokningar tillsammans med att spara en chache med datan. Om användare är admin visas alla bokningar och chase skapas.
Kräver JWT: Ja.
Admin: Admin kan se alla bokningar anmvändare har skapat.
Data som krävs i header: {
      "Authorization": "Bearer <token>"
}


POST'/bookings/':
Skapar en bokning om all data finns tillgänglig, att rummet finns, att starttiden är innan sluttid samt att angiven tid inte överlappar med en existerande tid av alla bokningar för det rummet. Om inget problem framkommer sparas bokningen och realtid information skickas som kan visas i realtime för användare.
Kräver JWT: Ja. Skickas i header.
Admin: Admin kan se alla bokningar för alla användare.
Data som krävs i body: {
      'roomId': 'Rummets id',
      'startTime': 'Start datum',
      'endTime': 'Slut datum'
}


PUT'/bookings/:id'
Uppdaterar en existerande bokning gjord av användaren. Kontrollerar att den finns, att all data som behövs finns, att starten är tidigare än slutet samt att den nya angivna tiden inte överlappar med existerande bokad tid som inte är din egen. Admin kan uppdatera alla bokningar som fyller kraven ovan.
Kräver JWT: Ja. Skickas i header.
Admin: Ja. Kan uppdatera alla bokningar.
Data som krävs i body: {
      'roomId': 'Rummets id',
      'startTime': 'Start datum',
      'endTime': 'Slut datum'
}


DELETE'/bookings/:id'
Tar bort en skapad bokning från systemet och kontrollerar bara att bokningen finns. Admin kan ta bort alla bokningar som finns i systemet.
Kräver JWT: Ja. Skickas i header.
Admin: Ja. Kan radera alla bokningar.
Data som krävs i body: {
      'roomId': 'Rummets id'
}


Rooms
GET'/rooms/'
Hämtar alla rum som finns i systemet.
Kräver JWT: Nej.
Admin: Nej.
Data som krävs i body: Kräver ingen data.


POST'/rooms/'
Skapar ett rum i systemet för att kunna bokas. Kräver verifiering av admin då funktionen inte kan användas av vanliga användare.
Kräver JWT: Ja.
Admin: Ja.
Data som krävs i body: {
      'namn': 'Angivet namn',
      'capacity': 'numer av personer',
      'type': 'workspace/conference'
}


PUT'/rooms/:id'
Uppdaterar existerande rum. Hämtar och kontrollerar att rummet finns innan går vidare och uppdaterar det. Kräver verifiering av admin då funktionen inte kan användas av vanliga användare.
Kräver JWT: Ja.
Admin: Ja.
Data som krävs i body: {
      'namn': 'Angivet namn',
      'capacity': 'numer av personer',
      'type': 'workspace/conference'
}


DELETE'/rooms/:id'
Raderar existerande rum från systemet och kontrollerar bara att rummet existerar. Kräver verifiering av admin då funktionen inte kan användas av vanliga användare.
Kräver JWT: Ja.
Admin: Ja.
Data som krävs i body: {
      'roomId': 'Rummets id'
}
