Run `npm install` from rootpath of the project.

To start server:
`DEBUG=misi-back:* npm start`

Remember to add Node path in your EB environment
``PATH=$PATH:`ls -td /opt/elasticbeanstalk/node-install/node-* | head -1`/bin``
`NODE_ENV=production node`
