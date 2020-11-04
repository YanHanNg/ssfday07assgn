//Load Lib
const express = require('express');

const SQL_GET_TV_NAME_DESC = "SELECT tvid, name from tv_shows order by name desc limit ? offset ?";
const SQL_GET_TV_NAME_BY_SEARCH = "SELECT tvid, name from tv_shows where name like ? order by name desc limit ? offset ?";
const SQL_GET_TV_DETAIL_BY_ID = "SELECT * from tv_shows where tvid = ?";

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

module.exports = function(p)
{
    const pool = p;
    const router = express.Router();

    //Application
    router.get('/', async (req, res) => {
        //Render
        res.status(200);
        res.type('text/html');
        res.render('searchtv')
    })

    router.get('/search', async (req, res) => {

        const q = req.query['tvNames'];
        if(q.toLowerCase() === 'burden')
        {
            res.status(200);
            res.type('text/html');
            res.send(`<h1> You mai lai leh, cs jiu cs search simi burden. NBC</h1>`)
        }
        else
        {
            try{
                //const [results, _] = await conn.query(SQL_GET_TV_NAME_BY_SEARCH, [ `%${q}%`, 10, 0 ]);
                const getTVList = mkQuery(SQL_GET_TV_NAME_BY_SEARCH, pool);
    
                const results = await getTVList([ `%${q}%`, 10, 0 ]);
    
                //Render
                res.status(200);
                res.type('text/html');
                res.render('tvlist', {
                    tvlist: results,
                    haveResults: results.length
                })
    
            }
            catch(err) {
                console.error('Error During Query', err);
            }
            finally {
                //conn.release();
            }
        }
        //const conn = await pool.getConnection();  
    })

    router.get('/tvlist/:tvId', async (req, res) => {

        //const conn = await pool.getConnection();
        try{
            //const [results, _] = await conn.query(SQL_GET_TV_DETAIL_BY_ID, [ req.params.tvId ]);
            const getTVDetails = mkQuery(SQL_GET_TV_DETAIL_BY_ID, pool);

            const results = await getTVDetails([ req.params.tvId ]);

            //Render
            res.status(200);
            res.type('text/html');
            res.render('tvDetails', {
                tvDetail: results[0]
            })

        }
        catch(err) {
            console.error('Error During Query', err);
        }
        finally {
            //conn.release();
        }
    })

    return router;
}


