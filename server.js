'use strict';

const express = require('express');
const logger = require('morgan');
const bodyParser = require('body-parser');
const compression = require('compression');
const helmet = require('helmet');
const dotenv = require('dotenv');
const cors = require('cors');

const  moment = require('moment');
dotenv.config();
const routes = require('./src/routes/index');
const winston = require('./config/winston');
const db = require('./models');

const env = process.env.NODE_ENV || 'development';

const port = process.env.PORT || '8000';

const app = express();
//const io = require('socket.io')(5000);
const io = require('socket.io')(5000, {
    cors: {
            origin: [process.env.FRONTEND_URL],
     },
  });


app.use(helmet());
app.use(compression());
app.use(cors());

app.use(logger('combined', { stream: winston.stream }));
app.set('view engine', 'ejs');
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static('public'));
app.use(process.env.ROUTE_PREFIX, routes);

let count = 0;
let flag = true;
let rId = 0;
io.on('connect', function(socket) {
    // emit to the newly connected client the existing count 
    socket.emit('counter updated', count);
  
    // we listen for this event from the clients
    socket.on('counter clicked', () => {
      // increment the count
      count++;
      console.log('Button is clicked')
      // emit to EVERYONE the updated count
      io.emit('counter updated', count);
    });

    socket.on('snooze clicked', (data) => {
        console.log('Snooze clicked');
        console.log(data);
        let result = data.replace("abc", "");
        result = result.split("-");
        updateQuerySnooze(result[1])
    });
    
    socket.on('notification clicked', (data) => {
        console.log('notification clicked');
        console.log(data);
        let result = data.replace("abc", "");
        result = result.split("-");
        updateQuerySeeNotification(result[1])
    });  

    setInterval(() => {    
        runQuery();    
        if(rId != 0){
                socket.emit('open modal', rId);
        }         
        rId = 0;
        runQuery();
    }, 60000);

  
});

function runQuery(){
    const results =  db.sequelize.query("SELECT * FROM bookings where  modal_done = 1 AND status != 'Ready'").then((res) => {
        showModalForRecentTime(res[0]);  
    });
}

function updateQuerySnooze(id){
    const results =  db.sequelize.query("UPDATE bookings SET  snooze = 2 where id = " + id).then((res) => {
      
    });
}


function updateQuerySeeNotification(id){
    const results =  db.sequelize.query("UPDATE bookings SET  modal_done = 2 where id = " + id).then((res) => {
       
    });
}

function showModalForRecentTime(items) {
    //console.log('showModalForRecentTime')
    let diffTime = 0;
    let absTime = 0;
    let calculatedTime = 0;
    if (items.length > 0) {
      items.map((item, i) => {
        var now  = moment();
        var then = moment(item.ready_date);
       // console.log('then',then);
        diffTime = moment.utc(moment(then,"DD/MM/YYYY HH:mm:ss").diff(moment(now,"DD/MM/YYYY HH:mm:ss"))).format("mm")

        console.log('diffTime',diffTime);
        //console.log(item.reservation_id);
        if (diffTime < 59 && diffTime > 0) {
            //console.log(item.reservation_id);
            rId = item.reservation_id + "-" + item.id;
            return false;
        }
      });
    }
  };

//database test
db.sequelize.authenticate()
    .then(() => console.log('Database connected'))
    .catch(err => console.log('Database connection error: ' + err));


db.sequelize.sync({ alter: false })
    .then(() => {
        console.log('DB synced')
        runQuery();
        
        app.listen(port, () => {
            console.log(`Example app listening on port ${port}`);
        
        });
        
    
        
    })
    .catch(err => console.log('Database sync error : ' + err));

    
   
