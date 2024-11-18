# Some Notes Before You Begin
Make sure you follow all of the steps in "Setting Up Your Development Environment" before attempting to even look at the code. 

Also, read through the docs linked under the "Contributing to the Codebase" section so you can get a feel for the tools and syntax we will be going through.

# Setting Up Your Development Environment

Before you begin, create a folder for this team wherever you want to store any GitHub repos that you will be cloning on your device in this cohort. You can name it include, platform_team, or literally anything you want to. If you choose to name it "include", **do not use a '#' in your folder name**, it'll cause a bunch of problems later.

## 1. Node.js

Node.js is a runtime environment that is used to run Javascript code. It comes with the Node Package Manager (npm) that helps us manage the Javascript packages used in our project. To set up node.js:

1. Download the Node.js installer for your OS from https://nodejs.org/en/download/current
2. Run the installer and follow the installation wizard.
3. Once the installation finishes, open a terminal on VSCode and type _node --version_ to verify your node installation. Type _npm --v_ to verify your npm installation.

   a. If you get an error saying that node or npm is not recognized as a command, try restarting VSCode to see if the issue fixes itself. (If you had VSCode opened while installing Node, this should fix it.)
   b. If the problem persists, search for _Environment variables_ in your Start menu. Click on _Edit your Environment variables_. Click on _Environment Variables_ in the new window that opens up.
   c. Find the variable _Path_ and click on _Edit_.
   d. Check for _C:\Program Files\nodejs\\_ in the list of paths that appear. If it's not there, click on _New_ and add it to the list.
   e. Restart VSCode and it should ideally work now.

**If you already have node**  
Try to update your node version to roughly v21.1.0 so you don't get random warnings.

## 2. ESLint Extension

ESLint is an extension that ensures that your code adheres to certain code style. It also auto-formats your code on save in VSCode. To enable it:

1. Go to the Extensions tab on VSCode and install _ESLint_.
2. Once it is installed, open your Command Palette by pressing **Ctrl + SHift + P**/**Command + Shift + P** and search for **Preferences: Open Workspace Settings (JSON)**. Open the file and add this code into the file. This will autoformat your code on save and also configure tab sizes:

   ```json
    {
        "editor.codeActionsOnSave": {
            "source.fixAll.eslint": "explicit"
        },
        "eslint.validate": [
            "javascript",
            "typescript",
        ],
        "[javascriptreact]": {
            "editor.indentSize": 2
        },
        "[javascript]": {
            "editor.indentSize": 2
        },
        "[typescriptreact]": {
            "editor.indentSize": 2
        },
        "[typescript]": {
            "editor.indentSize": 2
        },
        "[jsonc]": {
            "editor.indentSize": 2
        },
    }
   ```

## 3. PostgreSQL
1. Install Postgres by following this tutorial: https://www.prisma.io/dataguide/postgresql/setting-up-a-local-postgresql-database#setting-up-postgresql-on-windows
2. Follow this tutorial to create a user and create a database: https://commandprompt.com/education/how-to-create-user-create-database-grant-privileges-in-postgresql/
3. Grant the user you just created CREATEDB permissions with the command ```ALTER USER username CREATEDB;```

## 4. DBeaver
By now, you should have a database and user created in postgres. This means you can try connecting to it in DBeaver, a nice UI tool that allows you to view your database and also view ER diagrams.
1. Connect to your database by clicking the new database connection in the top left corner. It should look like a Plug with a green + sign.
2. Choose Postgres when asked for Database type.
3. You should only have to change 3 things: "Database", "Username", and "Password". Change those to the name of the database you created, the name of your user, and the password you chose for that user.
4. If it works, then you should be able to click into the database connection and view the contents by going through it like a file structure. The path for our data will be ```Databases --> [dbname] --> Schemas --> public```. There shouldn't really be anything to see but if you can click around the "file structure" it means you're connected.

## 5. Environment File
Create a file called ```.env``` in the root of the codebase and paste in the following (replace ```username```, ```password```, and ```db_name``` to fit your own information which is the same as what you input into DBeaver).
```
DATABASE_URL="postgresql://username:password@localhost:5432/db_name?schema=public"
```

## 6. Other Extensions
For Prisma file highlighting: https://marketplace.visualstudio.com/items?itemName=Prisma.prisma

For GraphQL schema highlighting: https://marketplace.visualstudio.com/items?itemName=GraphQL.vscode-graphql-syntax

Auto Rename Tag — useful for JSX

## Getting Started
Set up:

`npm install` for package installations. This will install all packages specified in the package.json file.

Run the development server:

```bash
npm run dev
```

Run a linting test:

```bash
npm run lint
```

## Migrations
If you want to reset the database, or if your migration history is not in sync with the database, try running: ```npx prisma migrate dev```.  
This will reset your database and make sure your database is in sync with the prisma schema.

# Contributing to the Codebase - Frontend
## React Resources
- https://react.dev/learn/tutorial-tic-tac-toe
- https://react.dev/reference/react/useState
- https://react.dev/reference/react/useEffect
- Read up on React Hooks
- Read up on React Context (global state management | optional)

## HTML/CSS Resources
- https://css-tricks.com/snippets/css/a-guide-to-flexbox/

## App Router
Next.js versions 13+ implemented the App Router which allows for colocation of files. With the Page Router, we used to define pages directly by creating a `jsx` file with the page name inside of a pages directory.

Now, with App Router, we define pages by creating a directory within the `app` folder where a route is defined only when there is a `page.jsx` file inside of the directory. To create a new route, you will create a folder, for example: `about-us` and create a `page.jsx` file inside. Once you populate the `page.jsx` file with a React Component, the route `http://[domain]/about-us` should exist.

To create directories that are guarenteed to never produce a new route in your app, prefix the directory name with `_`, for example: `_components`. You can achieve the same thing by just naming it `components` and ensuring that no `page.jsx` file ever appears in the directory, however, I want to keep things explicit so we will stick with the underscore.

To create groupings of files without affecting the routes, you can wrap your folder name with parenthesis: `(index-page)`. In our codebase, I have done this to seperate the front and backend by creating a grouping for `(api)` and `(pages)`. Notice how `(api)` or `(pages)` never appears in our route when we navigate through the app. I have done this to `(index-page)` to group our page information for the route at `/` inside a folder rather than having it linger in the root of our `(pages)` directory.

### Resources
- https://nextjs.org/docs/app/building-your-application/routing/defining-routes
- https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts
- https://nextjs.org/docs/app/building-your-application/routing/route-groups
- https://nextjs.org/docs/app/building-your-application/routing/dynamic-routes

## Layouts
Next.js 13+ also added in the super useful tool called layouts. Layouts essentially wrap around your pages to provide the same "layout" to each page that the layout applies to. An example is having a Navbar and Footer that are shared by every page of the app. Rather than defining the Navbar and Footer in each page, you can add it to the root layout and have the layout apply to each page by writing the code once.

Layouts are defined with a `layout.jsx` file and the layout applies to:
- the page in the directory of the layout file
- all other pages that are descendents of the directory that `layout.jsx` is in.

Layouts also stack on top of each other. You could have a root layout that puts a navbar on the top of the page and another layout in the `/examples` route that puts a sidebar on anything examples related. This means when you navigate to `/examples` or `/examples/some-example`, you will see both a navbar and a sidebar. However, other routes like `/about-us` will only have a navbar since this route is only affected by the root layout.

Since we have a `layout.jsx` in the root of the `(pages)` directory, all of our frontend is affected by this file.

### Resources
- https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts

## File Structure
To keep a maintainable codebase, we will be following strict rules that allow us to keep our codebase organized and clean. In the root of `(pages)`, you will notice that we have three folders:
- _components
- _data
- _hooks

These three folders should account for every type of file you'll ever need to create. In each subdirectory, for example, `about-us`, we can also have these three folders.

Lets say I want to create the Navbar component. I will first think about which parts of the codebase the navbar is used by. Since the Navbar is a part of every page and called by the root layout, it makes sense to define the Navbar inside the `_components` folder of the root folder.

If I want to define a Sidebar that is only used by the `examples` route, and children of the `examples` route, then it makes sense to put the Sidebar component inside the `_components` folder of the `examples` directory. In short, find the level of nesting that accounts for all use cases for your component, data, utils, hooks and define your code in that level.

**Note:** The `layout.jsx` file in the root of `(pages)` sort of breaks the pattern I was talking about. It was supposed to be in the `(index-page)` directory since that handles all of the `/` routes, but a nuance of using the parenthesis to create route groupings forces us to put the `layout.jsx` on layer above. This won't be an issue for other pages however, so just put the `layout.jsx` with the `page.jsx` file whenever you plan on making a layout for certain routes.

### Public Folder
The public folder is where we can store media such as pdfs, images, videos. To keep this organized, create a new folder for each page the content is related to. To access content in the public folder, you don't need to do any of the `../../public` stuff. Next.js automatically routes `/` to the public folder.

For example, if you have an image stored in `/public/about-us/alec.png`, you can access it with `/about-us/alec.png` from anywhere in your code.

## SCSS Modules
We will be using SCSS since it just provides more options for how to format our CSS code. If you don't want to learn SCSS, it's fine, since CSS works just as well in scss files. Also, we will be using css modules for our Next.js app. CSS Modules (in our case SCSS modules) are defined like so: `Navbar.module.scss`. The reason we are using modules is because they localize our CSS classes so there is no possibility of 2 people using the same class name and having conflict.

### Resources
- https://create-react-app.dev/docs/adding-a-css-modules-stylesheet/

## Serverless Functions
To create your API from serverless functions, go to the `(api)` folder which contains a file structure similar to the `(pages)` folder. Instead of having `_components` and `_hooks`, the `(api)` folder only has the `_utils` folder which will be used to define global utility functions. I defined three folders: `db`, `request`, and `response`. These are designed such that all database related utility functions are defined in `db`, request processing related functions will be in `request`, and response related utility such as custom Errors are defined in `reponse`.

If you see a case where some utility only applies to a certain set of endpoints, feel free to create local `_utils` folders using the same logic as before for local `_components` and `_hooks`.

You'll see that there are folders defined with square brackets around the name such as `[id]`. These are dynamic routes and they work on the frontend as well. 

**Resources**
- https://nextjs.org/docs/app/building-your-application/routing/dynamic-routes
- https://restfulapi.net/http-methods/
- https://medium.com/@nadinCodeHat/rest-api-naming-conventions-and-best-practices-1c4e781eb6a5

**Note**
If your app only has a frontend, feel free to delete the `(api)` folder. If it does have a backend, keep reading!

# Contributing to the Codebase - Backend
## Adding a new Data Type
### Prisma
Prisma is our ORM (object relational mapping). It allows us to manipulate our database without writing raw SQL(which is very error prone). It transforms our CRUD operations into an object oriented style.

**Documentation to read through for Prisma**
- https://www.prisma.io/docs/concepts/components/prisma-schema/data-model#defining-fields
- https://www.prisma.io/docs/concepts/components/prisma-schema/relations
- https://www.prisma.io/docs/concepts/components/prisma-client/crud

Prisma also creates database migrations for us. Database Migrations are effectively incremental SQL commands that are fed to our database one by one to change schemas or seed the database.

**Resources on Database Migrations**
- https://www.astera.com/type/blog/database-migration-what-it-is-and-how-it-is-done/

To create a new data type, your first step is to create a new ```[DataType].schema``` file in the /prisma/models folder where the datatype name is **singular** (Post, User, Song, Playlist, UserInterface, ColorPalette).

After you're done making the schema, run ```npm run schema:gen``` to compile it. Prisma does not support multifile schemas so we had to use a bash script to combine it into schema.prisma manually.

### GraphQL
GraphQL is our REST API alternative. We are running an Apollo/GraphQL server on express. GraphQL has the benefit of allowing us to specify the structure of the data we want back from the server. This way, we avoid receiving excess data.

**Resources on GraphQL/Apollo**  
These are pulled from https://www.apollographql.com/tutorials/browse
- https://www.apollographql.com/tutorials/lift-off-part1
- https://www.apollographql.com/tutorials/lift-off-part2
- https://www.apollographql.com/tutorials/lift-off-part3
- https://www.apollographql.com/tutorials/lift-off-part4

#### TypeDefs
When creating a new DataType, similarly to the Prisma schema, you have to define the schema in GraphQL, using the same DataType and field names as you did in the prisma file. To do so, add a file called ```[DataType].js``` in the /src/typeDefs folder once again using **singular** names for the datatype.

After creating the ```[DataType].js``` file, add it to the /src/typeDefs/index.js

#### Resolvers
GraphQL allows you to add fields to your typeDefs that do not correlate to a field in the database. When this happens, you have to define how GraphQL should handle the request. You can also use resolvers to define queries and mutations in GraphQL.

To do so, add a file called ```[DataType].js``` in the /src/resolvers folder once again using **singular** names for the datatype.

After creating the ```[DataType].js``` file, add it to the /src/resolvers/index.js

#### Services
Services are not built into GraphQL, but most people split the functionality from resolvers into the definitions and the actual logic behind the scenes. Our codebase defines these functions as static methods to a class that has the same name as the DataType but **PURAL**.

Create a ```[DataType(s)].js``` file in /src/services and copy the template from other files.