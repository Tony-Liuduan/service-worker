// mock 数据
var Path = 'gallery/';
var Gallery = {
    'images': [
        {
            'name': 'Darth Vader',
            'alt': 'A Black Clad warrior lego toy',
            'url': '/gallery/myLittleVader.jpg',
            'credit': '<a href="//www.flickr.com/photos/legofenris/">legOfenris</a>, published under a <a href="//creativecommons.org/licenses/by-nc-nd/2.0/">Attribution-NonCommercial-NoDerivs 2.0 Generic</a> license.'
        },
        {
            'name': 'Snow Troopers',
            'alt': 'Two lego solders in white outfits walking across an icy plain',
            'url': '/gallery/snowTroopers.jpg',
            'credit': '<a href="//www.flickr.com/photos/legofenris/">legOfenris</a>, published under a <a href="//creativecommons.org/licenses/by-nc-nd/2.0/">Attribution-NonCommercial-NoDerivs 2.0 Generic</a> license.'
        },
        {
            'name': 'Bounty Hunters',
            'alt': 'A group of bounty hunters meeting, aliens and humans in costumes.',
            'url': '/gallery/bountyHunters.jpg',
            'credit': '<a href="//www.flickr.com/photos/legofenris/">legOfenris</a>, published under a <a href="//creativecommons.org/licenses/by-nc-nd/2.0/">Attribution-NonCommercial-NoDerivs 2.0 Generic</a> license.'
        },
    ]
};



// main 逻辑
function imgLoad(imgJSON) {
    // return a promise for an image loading
    return new Promise(function (resolve, reject) {
        var request = new XMLHttpRequest();
        request.open('GET', imgJSON.url);
        request.responseType = 'blob';

        request.onload = function () {
            if (request.status == 200) {
                var arrayResponse = [];
                arrayResponse[0] = request.response;
                arrayResponse[1] = imgJSON;
                resolve(arrayResponse);
            } else {
                reject(Error('Image didn\'t load successfully; error code:' + request.statusText));
            }
        };

        request.onerror = function () {
            reject(Error('There was a network error.'));
        };

        // Send the request
        request.send();
    });
}

function main() {
    var imgSection = document.getElementById('root');

    // load each set of image, alt text, name and caption
    for (var i = 0; i <= Gallery.images.length - 1; i++) {
        imgLoad(Gallery.images[i])
            .then(function (arrayResponse) {
                var myImage = document.createElement('img');
                var myFigure = document.createElement('figure');
                var myCaption = document.createElement('caption');

                var imageURL = window.URL.createObjectURL(arrayResponse[0]);
                myImage.src = imageURL;
                myImage.setAttribute('alt', arrayResponse[1].alt);
                myCaption.innerHTML = '<strong>' +
                    arrayResponse[1].name + '</strong>: Taken by ' + arrayResponse[1].credit;
                imgSection.appendChild(myFigure);
                myFigure.appendChild(myImage);
                myFigure.appendChild(myCaption);
            })
            .catch(e => {
                console.log(e)
            });
    }
}


main();

setTimeout(() => {
    //  main();
}, 5000);