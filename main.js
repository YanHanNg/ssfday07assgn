//Load Lib
const express = require('express');
const hbs = require('express-handlebars');
const mysql = require('mysql2/promise');

//Configure PORT
const PORT = parseInt(process.argv[2]) || parseInt(process.env.PORT) || 3000;

//Configure Express and Handlebars
const app = express();
app.engine('hbs', hbs({ defaultLayout: 'default.hbs' }));
app.set('view engine', 'hbs');

//Set up mySQL POOL
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    database: process.env.DB_DATABASE || 'leisure',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    connectionLimit: 4,
    timezone: '+08:00'
})

const mkQuery = (sqlStmt, pool) => {
    const f = async (params) => {
        const conn = await pool.getConnection();

        try{
            const results = await conn.query(sqlStmt, params);
            return results[0];
        }
        catch(e) {
            return Promise.reject(e);
        }
        finally {
            conn.release();
        }
    }
    return f
}

const tvRouter = require('./tv')(pool);
app.use('/', tvRouter);

// const SQL_GET_TV_NAME_DESC = "SELECT tvid, name from tv_shows order by name desc limit ? offset ?";
// const SQL_GET_TV_NAME_BY_SEARCH = "SELECT tvid, name from tv_shows where name like ? order by name desc limit ? offset ?";
// const SQL_GET_TV_DETAIL_BY_ID = "SELECT * from tv_shows where tvid = ?";

// const getTVList = mkQuery(SQL_GET_TV_NAME_BY_SEARCH, pool);

// //Application
// app.get('/', async (req, res) => {
//     //Render
//     res.status(200);
//     res.type('text/html');
//     res.render('searchtv')
// })

// app.get('/search', async (req, res) => {

//     const q = req.query['tvNames'];
//     //const conn = await pool.getConnection();

//     try{
//         //const [results, _] = await conn.query(SQL_GET_TV_NAME_BY_SEARCH, [ `%${q}%`, 10, 0 ]);
//         const results = await getTVList([ `%${q}%`, 10, 0 ]);

//         //Render
//         res.status(200);
//         res.type('text/html');
//         res.render('tvlist', {
//             tvlist: results,
//             haveResults: results.length
//         })

//     }
//     catch(err) {
//         console.error('Error During Query', err);
//     }
//     finally {
//         //conn.release();
//     }
// })

// app.get('/tvlist/:tvId', async (req, res) => {

//     const conn = await pool.getConnection();

//     try{
//         const [results, _] = await conn.query(SQL_GET_TV_DETAIL_BY_ID, [ req.params.tvId ]);

//         //Render
//         res.status(200);
//         res.type('text/html');
//         res.render('tvDetails', {
//             tvDetail: results[0]
//         })

//     }
//     catch(err) {
//         console.error('Error During Query', err);
//     }
//     finally {
//         conn.release();
//     }
// })


//Check if able to Ping Mysql before starting
pool.getConnection().then(conn => {

    const p0 = Promise.resolve(conn);
    const p1 = conn.ping();

    return Promise.all([ p0, p1]);
}).then(results=> {
    const conn = results[0];
    conn.release();

    app.listen(PORT, ()=> {
        console.info(`Server Started on PORT ${PORT} at ${new Date()}`);
    })
}).catch(err => {
    console.error('Unable to Start Server', err);
})