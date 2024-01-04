const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    // definition: {
    //     openapi: '3.0.0',
    //     info: {
    //         title: 'Api artnguide document gg',
    //         version: 'v1',
    //     },
    //     // servers: [
    //     //     {
    //     //         url: 'http://localhost:3000/api/v1',
    //     //         description: "test for BE"
    //     //     },
    //     //     {
    //     //         url: 'https://api.devartnguide.com/api/v1',
    //     //         description: "main server"
    //     //     }
    //     // ],

    //     // consumes:["application/json"]

    // },
    swaggerDefinition:{
        openapi: '3.0.1',
        info: {
            title: 'Api artnguide document gg',
            version: 'v1',
        },
        servers: [
            {
                url: 'http://localhost:3000/api/v1',
                description: "test for BE"
                
            },
            {
                url: 'https://api.devartnguide.com/api/v1',
                description: "main server"
            }
        ],
        components:{
            BearerAuth:{
                type: "http",
                scheme: "bearer"
            }
        }
    },
    // swaggerDefintion:{
    //     host:'localhost:3000',
    //     basePath:"/api/v1",
    // },
    apis: ['./server/api/*/index.js'], // files containing annotations as above
};
export const specs = swaggerJsdoc(options);
console.log(specs);
