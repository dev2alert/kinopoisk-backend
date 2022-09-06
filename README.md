<h1 align="center">Kinopoisk backend</h1>
<h2>Installing</h2>
<p>Preliminary requirements:</p>
<ul>
    <li><a href="https://nodejs.org/">Node.js</a> >= <code>16.14.2</code></li>
    <li><a href="https://www.npmjs.com/">npm</a> >= <code>8.16.0</code></li>
    <li><a href="https://www.docker.com/">Docker</a> >= <code>20.10.14</code></li>
    <li><a href="https://docs.docker.com/compose/">docker-compose</a> >= <code>1.29.2</code></li>
    <li><a href="https://www.gnu.org/software/make/">GNU Make</a> >= <code>3.81</code></li>
</ul>
<p>Installing dependencies:</p>
<pre>npm i</pre>
<h2>Building</h2>
<p>Compile code:</p>
<pre>npm run build</pre>
<h2>Starting</h2>
<p>Starting in production mode:</p>
<pre>npm start</pre>
<p>Starting in development mode:</p>
<pre>npm run dev</pre>
<p>Starting in development mode (with MYSQL Server):</p>
<pre>make run-dev</pre>
<p>Stopping MYSQL Server:</p>
<pre>make stop-dev</pre>
<h2>Environment variables</h2>
<p>List of variables:</p>
<ul>
    <li><code>NODE_ENV</code> - Application mode.</li>
    <li><code>PORT</code> - Server port listening. Default: 80.</li>
    <li><code>DATABASE_HOST</code> - Database host. Default: localhost.</li>
    <li><code>DATABASE_USER</code> - Database user. Default: root.</li>
    <li><code>DATABASE_PASSWORD</code> - Database password. Default: qwerty123.</li>
    <li><code>DATABASE_BASE</code> - Database base. Default: contacts-app.</li>
</ul>
<p><a href="https://www.npmjs.com/package/dotenv">Dotenv</a> support is present!</p>
<h2>Deploy</h2>
<p>Building image:</p>
<pre>make build</pre>
<p>Pushing image:</p>
<pre>make push</pre>
<p>Pulling image:</p>
<pre>make pull</pre>
<p>Staring image:</p>
<pre>make run</pre>
<p>Stopping image:</p>
<pre>make stop</pre>
<h2>Stack</h2>
<p>
    <img src="https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white" />
    <img src="https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB" />
    <img src="https://img.shields.io/badge/mysql-%2300f.svg?style=for-the-badge&logo=mysql&logoColor=white" /> 
    <img src="https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white" />
    <img src="https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white" />
</p>
<h2>License</h2>
<p><a href="./LICENSE">MIT</a></p>
