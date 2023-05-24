if (window === top) {
    try {
        document.body.addEventListener('bannerElement', event => {
            fetch(event.detail, {
                "credentials": "include",
                "method": "GET",
                "mode": "cors"
            }).then(resp => resp.text()).then(content => {
                const elm = document.getElementById('banner600percentContainer').contentDocument;
                elm.write(content);
                elm.close();
            });
        });
    } catch (ex) {
    }
}

if (typeof browser !== 'undefined') {

    (function () {
        var __aplay = Audio.prototype.play;
        Audio.prototype.play = function () {
            this.setAttribute('crossorigin', 'anonymous');
            document.body.appendChild(this);
            __aplay.call(this);
        };

        const HOSTS_TO_APPLY = [
            'likee.com',
            'tiktok.com'
        ];

        function hostToApply(url) {
            if (!url) {
                return false;
            }
            for (var i = 0; i < HOSTS_TO_APPLY.length; i++) {
                if (url.indexOf(HOSTS_TO_APPLY[i]) > -1) {
                    return true;
                }
            }
            return false;
        }

        if (window.location === undefined) {
            return;
        }
        if (window.location.host && !hostToApply(window.location.host)) {
            return;
        }

        var __vplay = HTMLVideoElement.prototype.play;
        HTMLVideoElement.prototype.play = function () {
            var src = this.src;
            if (src) {
                this.setAttribute('crossorigin', 'anonymous');
                if (src.indexOf('https://') === -1 && window && window.location
                    && window.location.href && window.location.href.indexOf('https://') === 0) {
                    src = src.replace('http://', 'https://');
                }
                if (src.substring(0, 5) !== "blob:") {
                    this.src = src + '';
                }
            }

            __vplay.call(this);
        };
    })();
}