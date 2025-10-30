// /******************************************************************************
// ***
// * ITE5315 – Assignment 2
// * I declare that this assignment is my own work in accordance with Humber Academic Policy.
// * No part of this assignment has been copied manually or electronically from any other source
// * (including web sites) or distributed to other students.
// *
// * Name: __Mohammad Fawzaan Khan Juhoor___ Student ID: __N01707140___ Date: __28-10-2025___
// *
// *
// ******************************************************************************
// **/

// // Import the Express.js framework - used for building web applications and APIs
// var express = require('express');

// // Import the path module - provides utilities for working with file and directory paths
// var path = require('path');

// // Create an Express application instance - this is the main app object
// var app = express();

// // Destructure the engine function from express-handlebars - for template engine setup
// const { engine } = require('express-handlebars');

// // Set the port number - use environment variable if available, otherwise default to 3000
// const port = process.env.PORT || 3000;

// // Middleware: Serve static files from the 'public' directory
// // This makes CSS, images, and client-side JavaScript files accessible to the browser
// // path.join(__dirname, 'public') creates an absolute path to the public folder
// app.use(express.static(path.join(__dirname, 'public')));

// // Configure Handlebars as the template engine for the application
// // 'hbs' is the name we're giving to this engine configuration
// // engine() function sets up Handlebars with specified options
// app.engine('hbs', engine({ 
//     extname: '.hbs'  
// }));

// // Set Handlebars as the default view engine for the application
// // This tells Express to use Handlebars when rendering templates
// app.set('view engine', 'hbs');

// // Route: Handle GET requests to the root URL ('/')
// // When someone visits the homepage, this function runs
// app.get('/', function(req, res) {
//     // Render the 'index' template and pass data to it
//     // { title: 'Express' } - this object contains data that the template can use
//     res.render('index', { title: 'Express' });
// });

// // Route: Handle GET requests to '/users' URL
// // This is a simple API endpoint that returns text
// app.get('/users', function(req, res) {
//     // Send a plain text response back to the client
//     res.send('respond with a resource');
// });

// // Middleware: 404 Error Handler - catches all requests that don't match any routes
// // This runs when no other route matches the requested URL
// app.use((req, res) => {
//     // Set HTTP status to 404 (Not Found) and render the error template
//     res.status(404).render('error', { 
//         title: 'Error',        // Page title for the error page
//         message: 'Wrong Route' // Error message to display
//     });
// });

// // Start the server and make it listen on the specified port
// // This makes the application available at http://localhost:3000 (or the specified port)
// app.listen(port, () => {
//     // Callback function that runs when the server starts successfully
//     console.log(`Example app listening at http://localhost:${port}`);
// });



const express = require('express');
const path = require('path');
const fs = require('fs');
const { body, validationResult } = require('express-validator');
const app = express();
const port = 5500;

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

const exphbs = require('express-handlebars');
app.engine('hbs', exphbs.engine({
    extname: '.hbs',
    defaultLayout: 'main',
    helpers: {
        // Custom helper to format property name - replace empty with "N/A"
        formatPropertyName: function(name) {
            if (!name || name.trim() === '') {
                return 'N/A';
            }
            return name;
        },
        
        // Custom helper to check if name is empty for highlighting
        isEmptyName: function(name) {
            return !name || name.trim() === '';
        },
        
        // Helper to get row class based on name emptiness
        getRowClass: function(name) {
            if (!name || name.trim() === '') {
                return 'empty-name-row';
            }
            return '';
        },
        formatName: function(name) {
            if (!name || name.trim() === '') {
                return 'N/A';
            }
            return name;
        },
        isEmptyName: function(name) {
            return !name || name.trim() === '';
        }
    }
}));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

let airbnbData = [];

fs.readFile('airbnb_data.json', 'utf8', (err, data) => {
    if (err) {
        console.error('Error loading JSON data:', err);
        return;
    }
    airbnbData = JSON.parse(data);
    console.log('JSON data loaded successfully. Records:', airbnbData.length);
});

app.get('/', (req, res) => {
    res.render('index', {
        title: 'Home'
    });
});

app.get('/search/id/', (req, res) => {
    res.render('search-id', { 
        title: 'Search by Property ID'
    });
});

app.post('/search/id/', (req, res) => {
    const propertyId = req.body.propertyId.trim();
    
    if (!propertyId) {
        return res.status(400).render('error', { 
            title: 'Error',
            message: 'Property ID is required' 
        });
    }

    if (!airbnbData || airbnbData.length === 0) {
        return res.status(500).render('error', {
            title: 'Server Error',
            message: 'JSON data not loaded yet'
        });
    }

    const property = airbnbData.find(item => item.id == propertyId);
    
    if (property) {
        res.render('search-results', {
            title: 'Property Found',
            property: property
        });
    } else {
        res.status(404).render('search-not-found', {
            title: 'Property Not Found',
            searchedId: propertyId
        });
    }
});

app.get('/search/name/', (req, res) => {
    res.render('search-name', { 
        title: 'Search by Property Name'
    });
});

app.post('/search/name/', (req, res) => {
    const propertyName = req.body.propertyName.trim();
    
    if (!propertyName) {
        return res.status(400).render('error', { 
            title: 'Error',
            message: 'Property name is required' 
        });
    }

    if (!airbnbData || airbnbData.length === 0) {
        return res.status(500).render('error', {
            title: 'Server Error',
            message: 'JSON data not loaded yet'
        });
    }

    const results = airbnbData.filter(item => 
        item.NAME && item.NAME.toLowerCase().includes(propertyName.toLowerCase())
    );
    
    if (results.length > 0) {
        res.render('search-name-results', {
            title: 'Search Results',
            searchTerm: propertyName,
            results: results,
            resultsCount: results.length
        });
    } else {
        res.status(404).render('search-name-not-found', {
            title: 'No Properties Found',
            searchedName: propertyName
        });
    }
});

// Step 8: View all data in HTML table
app.get('/viewData', (req, res) => {
    if (!airbnbData || airbnbData.length === 0) {
        return res.status(500).render('error', {
            title: 'Server Error',
            message: 'JSON data not loaded yet'
        });
    }

    res.render('viewData', {
        title: 'All Airbnb Data',
        page: 'viewData',
        properties: airbnbData
    });
});

// Step 9
app.get('/viewData/clean', (req, res) => {
    if (!airbnbData || airbnbData.length === 0) {
        return res.status(500).render('error', {
            title: 'Server Error',
            message: 'JSON data not loaded yet'
        });
    }

    res.render('view-data-clean', {
        title: 'Clean Airbnb Properties',
        properties: airbnbData 
    });
});

app.get('/viewData/price', function(req, res) {
    res.render('priceSearch', {
        title: 'Search by Price Range',
        properties: [],
        searchPerformed: false,
        minPrice: '',
        maxPrice: ''
    });
});

// Handle price range form submission with validation
app.post('/viewData/price', 
    [
        // Sanitize and validate min price
        body('minPrice')
            .trim()
            .escape()
            .isFloat({ min: 0 })
            .withMessage('Minimum price must be a valid number greater than or equal to 0'),
        
        // Sanitize and validate max price
        body('maxPrice')
            .trim()
            .escape()
            .isFloat({ min: 0 })
            .withMessage('Maximum price must be a valid number greater than or equal to 0'),
        
        // Custom validation to ensure max price is greater than min price
        body('maxPrice').custom((value, { req }) => {
            if (parseFloat(value) <= parseFloat(req.body.minPrice)) {
                throw new Error('Maximum price must be greater than minimum price');
            }
            return true;
        })
    ],
    function(req, res) {
        const errors = validationResult(req);
        
        if (!errors.isEmpty()) {
            // Return form with validation errors
            return res.render('priceSearch', {
                title: 'Search by Price Range - Validation Error',
                properties: [],
                searchPerformed: false,
                minPrice: req.body.minPrice,
                maxPrice: req.body.maxPrice,
                errors: errors.array()
            });
        }

        const minPrice = parseFloat(req.body.minPrice);
        const maxPrice = parseFloat(req.body.maxPrice);
        
        // Filter properties within the price range
        const filteredProperties = airbnbData.filter(property => {
            // Extract numeric price from string (e.g., "$966 " -> 966)
            const price = parseFloat(property.price.replace(/[^\d.]/g, ''));
            return price >= minPrice && price <= maxPrice;
        }).slice(0, 50); // Limit to first 50 results for performance

        // Format the properties for display
        const formattedProperties = filteredProperties.map(property => ({
            id: property.id,
            NAME: property.NAME,
            host_id: property['host id'],
            host_identity_verified: property.host_identity_verified,
            host_name: property['host name'],
            price: property.price,
            numericPrice: parseFloat(property.price.replace(/[^\d.]/g, '')),
            first_image: property.images && property.images.length > 0 ? property.images[0] : property.thumbnail,
            thumbnail: property.thumbnail,
            images: property.images
        }));

        res.render('priceSearch', {
            title: `Search Results: $${minPrice} - $${maxPrice}`,
            properties: formattedProperties,
            searchPerformed: true,
            minPrice: minPrice,
            maxPrice: maxPrice,
            resultsCount: filteredProperties.length,
            totalProperties: airbnbData.length
        });
    }
);


app.use((req, res) => {
    res.status(404).render('error', {
        title: '404 - Not Found',
        message: 'This route does not exist!'
    });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

module.exports = app;


/******************************************************************************
***
* ITE5315 – Assignment 2
* I declare that this assignment is my own work in accordance with Humber Academic Policy.
* No part of this assignment has been copied manually or electronically from any other source
* (including web sites) or distributed to other students.
*
* Name: __Mohammad Fawzaan Khan Juhoor___ Student ID: __N01707140___ Date: __28-10-2025___
*
*
******************************************************************************
**/