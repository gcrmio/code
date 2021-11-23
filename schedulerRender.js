const {Pool, Client} = require('pg');

const pool = new Pool({
  host: process.env.PG_host,
  user: process.env.PG_user,
  password: process.env.PG_password,
  database: process.env.PG_database,
  port: process.env.PG_port,
  ssl: {
    rejectUnauthorized: false
  }
});

module.exports.viewStatus = function(req, res){
    let query = 'SELECT * FROM scheduler';
    pool.query(query, (err, result) => {
        if(err){
            console.log('query error: ' + err);
            res.status(404);
        }
        console.log(result); 
        return res.status(200).json(JSON.stringify(result.rows[0])); 
    })
    res.status(200);
}