const environments = { };

environments.staging = {
    httpPort: 3000,
    httpsPort: 3001,
    envName: 'staging'
};

environments.production = {
    httpPort: 5000,
    httpsPort: 5001,
    envName: 'production'
};

const envVariable = global.process.env.NODE_ENV;
const env = envVariable ? envVariable.trim().toLowerCase() : 'staging';
console.log(`Loading configuration from environment: '${env}'.`);

if(!environments[env]) console.log(`Could not find configuration for environment: '${env}'. Defaulting to staging.`); 
const config = environments[env] || environments.staging;
module.exports = config;
