var dataBase = (function(){

       var database = {}; //main object returned;

       //vars that control various functionality in the app
       //change these based on your preferences
       database.dateName = "date"; //used as default query parameter for get by date and get today's date functions
       database.dateFormat = "mm/dd/yyy"; //TODO create helper function to format dates using this standard

       /**
        * Creates an object in localstorage to represent a database
        * @param string - Name of database
        * @return undefined
        */
       database.create = function(name){
           if(localStorage.getItem(name))
           {
               console.error("Database of that name already exists!");
               return;
           }
           var nameArray = new Object()
           localStorage.setItem(name, JSON.stringify(nameArray));
       }


       /**
        * Adds an object to an established database object to act as a table in that database
        * @param string - Name of database to add to
        * @param string - Name of the table to Add
        * @param string- fields names of the table can do as many as needed.
        * @return undefined
        */
        database.newTable = function(database, name, options){
               if(_checkTableExists(database, name)){
                   console.error('Table already exists, please delete to prevent data loss');
                   return;
               }

               var loopVar = 0;
               var dataBaseArray = new Object();

               var options = Array.prototype.slice.call(arguments, 0); // Holds a list of all the arguments passed
               var database = options.shift();//Removed the first thre elements which is database that is being called
               var tableName = options.shift(); //assign table name and remove from list of options
               tableName = tableName.toLowerCase();
               size = options.length;


               //TODO make getDatabase into a helper function as we will use it multiple times
               var retrievedObject = localStorage.getItem(database);
               retrievedObject = JSON.parse(retrievedObject);

             retrievedObject[tableName] = Object();

               while(loopVar < size){
                   var prop = options[loopVar];
                   retrievedObject[tableName][prop] = Array();
                   loopVar++;
               }
               localStorage.setItem(database, JSON.stringify(retrievedObject));
           }

            /**
            * Populates a set table with values
            * @param string - Name of database to add to
            * @param string - Name of the table to Add
            * @param string- values for fields. Can support any number of fields and will apply null to any additional ones.
            * ******MUST GO IN ORDER THAT IS SET IN THE TABLE*******
            * @return undefined
            */
           database.setValues = function(database, table, values){
               table = table.toLowerCase();

               var retrievedObject = JSON.parse(localStorage.getItem(database));
               var loopVar = 0;

               while(loopVar < values.length)
               {
                       var property = values[loopVar][0];
                       var value = values[loopVar][1];
                       retrievedObject[table][property].push(value);
                   loopVar++;
               }

               localStorage.setItem(database, JSON.stringify(retrievedObject));
               // TODO: Check that all rows have been filled _checkTableIntegrity
                _checkTableIntegrity(database, table)
           }

        /**
        * Returns a specific table from a given database in workable format
        * @param string - Name of database
        * @param string - Name of the table
        * @return object
        */
        database.getTable = function(database, table)
        {
            table = table.toLowerCase();
            var retrievedObject = JSON.parse(localStorage.getItem(database));
            var table = retrievedObject[table];
            return table;
        }


       /**
       * THIS FUNCTION CHECKS TO ENSURE THAT EACH ROW IN TABLE HAS THE SAME AMOUNT.
       * IF SOMEONE ENETERS A ROW WITH A VALUE MISSING THEN THAT DATA WILL END UP BEHIND
       * THIS FUNCTION SHOULD BE CALLED ANYTIME "setValues()" IS AND ADDS A NULL VALUE
       * TO ANY FIELD THE USER DIDNT
       * @param string - Name of database
       * @param string - Name of the table
       * @return undefined
       */
       function _checkTableIntegrity(database, table)
       {
           table = table.toLowerCase();
           var retrievedObject = JSON.parse(localStorage.getItem(database));
           var tableContent = retrievedObject[table];

           var highestRow = -1; //first item will always be bigger preventing any issues

           for (var property in tableContent) {
               var propLength = tableContent[property].length;
               if(propLength > highestRow){
                   highestRow = propLength;
               }
           }

           for (var property in tableContent){
               propLength = tableContent[property].length;
               if(propLength < highestRow){
                   for(var x = propLength; x < highestRow; x++){
                       tableContent[property][x] = "NULL";
                   }
               }
           }
           retrievedObject[table] = tableContent;
           localStorage.setItem(database, JSON.stringify(retrievedObject));
       }


       /**
       * Adds a new field to a table and populates it with null values
       * @param string - Name of database
       * @param string - Name of the table
       * @param string - name of row
       * @return undefined
       */
       database.newRow = function(database, table, row)
       {
               var retrievedObject = JSON.parse(localStorage.getItem(database));
               var tableContent = retrievedObject[table];
               if(tableContent[row]){
                   alert('That Table Row Already Exists!');
                   return;
               }

               tableContent[row] = [];
               retrievedObject[table] = tableContent;
               localStorage.setItem(database, JSON.stringify(retrievedObject));
               _checkTableIntegrity(database, table);
       }

       /**
       * Selects data from a row that satisfies a particular piece of data
       * @param string - Name of database
       * @param string - Name of the table
       * @param string - value to query against
       * @param string - row to limit search to
       * @return object
       */
       database.select = function(database, table, row, value){
           var retrievedObject = JSON.parse(localStorage.getItem(database));
           var tableContent = retrievedObject[table];
           var rowContent = tableContent[row];
           var matchedElements = [];

           //creates an array of indexs that don't
           for(var x = 0; x < rowContent.length; x++){
               if(rowContent[x] != value){
                   matchedElements.push(x);
               }
           }

           for(var property in tableContent){
             for(var x = 0; x < matchedElements.length; x++){
               //TODO Test this next line some more. It works right now, but I feel it could behave weird for edge or non trival cases
               tableContent[property].splice((matchedElements[x]) - x, 1); //reduce the index by x as the array's size change
             }
           }
           return tableContent;
       }

       /**
       * Special helper function that database.select() all tables in a database for a given date.
       * Field is configurable in object vars - default is 'date'
       * @param string - Name of database
       * @param string - date to query in string format
       * @return object
       */
       database.getByDate = function(database, date)
       {
           var todayItem = new Object();
           var retrievedObject = localStorage.getItem(database);
           retrievedObject = JSON.parse(retrievedObject);
           //for each row in the database do this to create teh objects
           for(table in retrievedObject){
               var returnVal = database.select(database, table, database.dateName, queryDate)
               todayItem[table] = returnVal;
           }

           return todayItem;
       }

       /**
       * Helper function to determine if a table already exists in a given database to prevent date overriding
       * @param string - Name of database
       * @param string - Name of table
       * @return bool
       */
       function _checkTableExists (database, table)
       {
           var retrievedObject = localStorage.getItem(database);
           retrievedObject = JSON.parse(retrievedObject);

           if(!retrievedObject[table]){
               return false;
           }
           else{
               return true;
           }
       }


       /**
       * Special helper function identical to getByDate but only works for the current date
       * Uses dateFormt property of database object to determine the form of date to query against
       * @param string - Name of database
       * @return object
       */
       database.getToday = function(database)
       {
           var todayItem = new Object();
           var retrievedObject = localStorage.getItem(database);
           retrievedObject = JSON.parse(retrievedObject);
           var currentDate = new Date();
           var month = currentDate.getMonth() + 1;
           var day = currentDate.getDate();
           var year = currentDate.getFullYear();

           currentDate = month + '/' + day + '/' + year;
           for(table in retrievedObject){
               var returnVal = this.select(database, table, this.dateName, currentDate);
               todayItem[table] = returnVal;
           }

           return todayItem;

       }

return database;
})()
