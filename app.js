const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

const PLAYER_STORAGE_KEY = 'HoangCin_Player'

const heading = $('header h2')
const cdThumb = $('.cd-thumb')
const audio = $('#audio')
const cd = $('.cd')
const playBtn = $('.btn-toggle-play')
const player = $('.player')
const progress = $('#progress')
const nextBtn = $('.btn-next')
const prevBtn = $('.btn-prev')
const randomBtn = $('.btn-random')
const repeatBtn = $('.btn-repeat')
const playlist = $('.playlist')
// Xử lý hạn chế lặp song
var playedSong = []

const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    songs: [
        {
            name: "Attention",
            singer: "Charlie Puth",
            path: "./assets/music/Attention.mp3",
            image: "./assets/img/attention.jpg"
        },
        {
            name: "Cơn Mưa Ngang Qua",
            singer: "Sơn Tùng M-TP",
            path: "./assets/music/conmuangangqua.mp3",
            image: "./assets/img/conmuangangqua.jpg"
        },
        {
            name: "Monody",
            singer: "TheFatRat,Laura Brehm",
            path: "./assets/music/Monody.mp3",
            image: "./assets/img/monody.jpg"
        },
        {
            name: "Chắc Ai Đó Sẽ Về",
            singer: "Sơn Tùng M-TP",
            path: "./assets/music/chacaidoseve.mp3",
            image: "./assets/img/chacaidoseve.jpg"
        },
        {
            name: "Lối Nhỏ",
            singer: "Đen,Phương Anh Đào",
            path: "./assets/music/loinho.mp3",
            image: "./assets/img/loinho.jpg"
        },
        {
            name: "Nevada",
            singer: "Vicetone,Cozi Zuehlsdorff",
            path: "./assets/music/Nevada.mp3",
            image: "./assets/img/nevada.jpg"
        },
        {
            name: "Ngày Khác Lạ",
            singer: "Đen,Giang Phạm,Triple D",
            path: "./assets/music/NgayKhacLa.mp3",
            image: "./assets/img/ngaykhacla.jpg"
        },
        {
            name: "Reality",
            singer: "Lost Frequencies,Janieck Devy",
            path: "./assets/music/Reality.mp3",
            image: "./assets/img/reality.jpg"
        },
        {
            name: "Sugar",
            singer: "Maroon 5",
            path: "./assets/music/Sugar.mp3",
            image: "./assets/img/sugar.jpg"
        },
        {
            name: "Summertime",
            singer: "K-391",
            path: "./assets/music/Summertime.mp3",
            image: "./assets/img/summertime.jpg"
        },
        {
            name: "Waiting For Love",
            singer: "Avicii",
            path: "./assets/music/WaitingForLove-Avicii.mp3",
            image: "./assets/img/waitingforlove.jpg"
        },
        {
            name: "Top Hit English Love Songs",
            singer: "Various Singers",
            path: "./assets/music/tophitenglishlovesongs.mp3",
            image: "./assets/img/tophitenglishlovesongs.jpg"
        },
        {
            name: "10 Bản Nhạc Indie Hay Nhất Bạn Đừng Nên Bỏ Lỡ...",
            singer: "Nghệ Sĩ Việt",
            path: "./assets/music/10bannhacindie.mp3",
            image: "./assets/img/10bannhacindie.jpg"
        },
    ],
    setConfig: function(key, value) {
        this.config[key] = value
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config))
    },
    render: function () {
        const htmls = this.songs.map((song, index) => {
            return `
                <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index="${index}">
                    <div class="thumb" style="background-image: url('${song.image}')">
                    </div>
                    <div class="body">
                        <h3 class="title">${song.name}</h3>
                        <p class="author">${song.singer}</p>
                    </div>
                    <div class="option">
                        <i class="fas fa-ellipsis-h"></i>
                    </div>
                </div>
            `
        })
        playlist.innerHTML = htmls.join('');
    }, 
    defineProperties: function() {
        Object.defineProperty(this, 'currentSong', {
            get: function() {
                return this.songs[this.currentIndex]
            }
        })
    },
    handleEvents: function() {
        const _this = this
        const cdWidth = cd.offsetWidth

        // Xử lý CD quay / dừng
        const cdThumbAnimate = cdThumb.animate([
            {transform: 'rotate(360deg)'}
        ], {
            duration: 10000, // 10 sec
            iterations: Infinity
        })
        cdThumbAnimate.pause()

        // Xử lý phóng to / thu nhỏ CD
        document.onscroll = function() {
            const scrollTop = window.scrollY || document.documentElement.scrollTop
            const newCdWidth = cdWidth - scrollTop

            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0
            cd.style.opacity = newCdWidth / cdWidth
        }

        // Xử lý khi click play
        playBtn.onclick = function() {
            if (_this.isPlaying) {
                audio.pause()
            } else {
                audio.play()
            }
        }

        // Khi song được play
        audio.onplay = function() {
            _this.isPlaying = true
            player.classList.add('playing')
            cdThumbAnimate.play()
        }

        // Khi song bị pause
        audio.onpause = function() {
            _this.isPlaying = false
            player.classList.remove('playing')
            cdThumbAnimate.pause()
        }
        // Khi tiến độ song thay đổi
        audio.ontimeupdate = function() {
            if (audio.duration) {
                const progressPercent = Math.floor(audio.currentTime / audio.duration * 100)
                progress.value = progressPercent
            }
        }

        // Xử lý khi tua song
        progress.oninput = function(e) {
            const seekTime = audio.duration * e.target.value / 100
            audio.currentTime = seekTime
        }

        // Khi next song
        nextBtn.onclick = function() {
            if (_this.isRandom) {
                _this.playRandomSong()
                playedSong.push(_this.currentIndex)
                if (playedSong.length === _this.songs.length)
                    playedSong = []
            } else {
                _this.nextSong()
            }
            audio.play()
            _this.render()
            _this.scrollToActiveSong()
        }

        // Khi prev song
        prevBtn.onclick = function() {
            if (_this.isRandom) {
                _this.playRandomSong()
                playedSong.push(_this.currentIndex)
                if (playedSong.length === _this.songs.length)
                    playedSong = []
            } else {
                _this.prevSong()
            }
            audio.play()
            _this.render()
            _this.scrollToActiveSong()
        }

        // Xử lý bật / tắt randomSong
        randomBtn.onclick = function(e) {
            _this.isRandom = !_this.isRandom
            _this.setConfig('isRandom', _this.isRandom)
            randomBtn.classList.toggle('active', _this.isRandom)
        }

        // Xử lý lặp lại một song
        repeatBtn.onclick = function(e) {
            _this.isRepeat = !_this.isRepeat
            _this.setConfig('isRepeat', _this.isRepeat)
            repeatBtn.classList.toggle('active', _this.isRepeat)
        }

        // Xử lý next song khi audio ended
        audio.onended = function() {
            if (_this.isRepeat) {
                audio.play()
                _this.scrollToActiveSong()
            } else {
                playedSong.push(_this.currentIndex)
                if (playedSong.length === _this.songs.length)
                    playedSong = []
                nextBtn.click()
                _this.scrollToActiveSong()
            }
        }

        // Lắng nghe hành vi click vào playlist
        playlist.onclick = function(e) {
            const songNode = e.target.closest('.song:not(.active)')
            if (songNode || e.target.closest('.option')) {
                // Xử lý click vào song
                if (songNode) {
                    _this.currentIndex = Number(songNode.dataset.index)
                    _this.setConfig('currentIndexSong', _this.currentIndex)
                    _this.loadCurrentSong()
                    _this.render()
                    _this.scrollToHeading()
                    audio.play()
                }
                // Xử lý khi click vào option
                if (e.target.closest('.option')) {

                }
            }
        }
    },
    scrollToActiveSong: function() {
        setTimeout(() => {
            $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block: this.currentIndex === 0 ? 'end' : 'center'
            })
        }, 200)
    },
    scrollToHeading: function() {
        setTimeout(() => {
            const firstSong = document.querySelectorAll('.song')[0];
            firstSong.scrollIntoView({
                behavior: 'smooth',
                block: 'end'
            })
        }, 200)
    },
    loadCurrentSong: function() {
        heading.textContent = this.currentSong.name
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`
        audio.src = this.currentSong.path
    },
    loadConfig: function() {
        this.isRandom = this.config.isRandom
        this.isRepeat = this.config.isRepeat
        this.currentIndex = parseInt(this.config.currentIndexSong) || 0
    },
    nextSong: function() {
        this.currentIndex++
        if(this.currentIndex >= this.songs.length)
            this.currentIndex = 0
        this.setConfig('currentIndexSong', this.currentIndex)
        this.loadCurrentSong()
    },
    prevSong: function() {
        this.currentIndex--
        if(this.currentIndex < 0)
            this.currentIndex = this.songs.length - 1
        this.setConfig('currentIndexSong', this.currentIndex)
        this.loadCurrentSong()
    },
    playRandomSong: function() {
        let newIndex
        do {
            newIndex = Math.floor(Math.random() * this.songs.length)
        } while (playedSong.includes(newIndex))

        this.currentIndex = newIndex
        this.setConfig('currentIndexSong', this.currentIndex)
        this.loadCurrentSong()
    },
    start: function () {
        // Gán cấu hình từ config vào ứng dụng
        this.loadConfig()

        // Định nghĩa các thuộc tính cho object
        this.defineProperties()

        // Lắng nghe và xử lý các sự kiện (DOM events)
        this.handleEvents()

        // Tải thông tin bài hát đầu tiên vào UI khi chạy ứng dụng
        this.loadCurrentSong()

        // Render playlist
        this.render()

        // Hiển thị trạng thái ban đầu của button repeat & random
        randomBtn.classList.toggle('active', this.isRandom)
        repeatBtn.classList.toggle('active', this.isRepeat)
    },
};

app.start()


