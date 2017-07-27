const expect = require('unexpected')
const pb = require('../lib/photobucket')

describe('photobucket', () => {
  describe('patterns', () => {
    it('matches photobucket', () => {
      const url = 'https://i282.photobucket.com/albums/kk251/BKL93908/NORTON%20TANK%20on%20V11_zpsibge9erf.jpg'
      const matches = url.match(pb.patterns.photobucket)
      expect(matches[0], 'to equal', 'photobucket.com')
    })

    it('matches direct html', () => {
      const url = 'https://i282.photobucket.com/albums/kk251/BKL93908/NORTON%20TANK%20on%20V11_zpsibge9erf.jpg'
      const matches = url.match(pb.patterns.directHtml)

      expect(matches[1], 'to equal', 'albums/kk251/BKL93908/NORTON%20TANK%20on%20V11_zpsibge9erf.jpg')
      expect(matches[2], 'to equal', 'kk251')
      expect(matches[3], 'to equal', 'BKL93908')
      expect(matches[4], 'to equal', 'NORTON%20TANK%20on%20V11_zpsibge9erf.jpg')
    })

    it('matches media html', () => {
      const url = 'http://s28.photobucket.com/user/docchaynes/media/FullSizeRender.jpg_2.jpeg.html'
      const matches = url.match(pb.patterns.mediaHtml)

      expect(matches[1], 'to equal', 'docchaynes')
      expect(matches[2], 'to equal', 'FullSizeRender.jpg_2.jpeg')
    })

    it('matches direct', () => {
      const url = 'http://img.photobucket.com/albums/v619/jere/garage%20journal/IMG_20150205_125121_zpsbjjagykv.jpg'
      const matches = url.match(pb.patterns.direct)

      expect(matches[1], 'to equal', 'albums/v619/jere/garage%20journal/IMG_20150205_125121_zpsbjjagykv.jpg')
      expect(matches[2], 'to equal', 'v619')
      expect(matches[3], 'to equal', 'jere')
      expect(matches[4], 'to equal', 'garage%20journal/IMG_20150205_125121_zpsbjjagykv.jpg')
    })

    it('matches media generic', () => {
      const url = 'photobucket.com/user/23432/media/whatever.jpg.jpg'
      const matches = url.match(pb.patterns.mediaGeneric)

      expect(matches[1], 'to equal', '23432')
      expect(matches[2], 'to equal', 'whatever.jpg.jpg')
    })

    it('matches media gallery', () => {
      const url = 'photobucket.com/gallery/user/e233d/media/car.html'
      const matches = url.match(pb.patterns.gallery)

      expect(matches[1], 'to equal', 'e233d')
      expect(matches[2], 'to equal', 'car')
    })

    it('matches media library', () => {
      const url = 'photobucket.com/user/ww32/library/mylibrary'
      const matches = url.match(pb.patterns.library)

      expect(matches[1], 'to equal', 'ww32')
      expect(matches[2], 'to equal', 'mylibrary')
    })

  })

  it('transformUrlParts', () => {
    const parts = pb.transformUrlParts({
      url: 'https://i282.photobucket.com/albums/kk251/BKL93908/NORTON%20TANK%20on%20V11_zpsibge9erf.jpg',
      album: 'v619',
      username: 'v619',
      key: 'garage%20journal/IMG_20150205_125121_zpsbjjagykv.jpg'
    })

    expect(parts, 'to satisfy', {
      key: 'garage journal/IMG_20150205_125121_zpsbjjagykv.jpg',
      mediaId: 'cGF0aDp1bmRlZmluZWQ='
    })
  })

  describe('parseUrl', () => {
    it('rejects non-photobucket urls', () => {
      return pb.parseUrl('notvalid.com')
        .catch((err) => {
          expect(err, 'to equal', 'Enter a photobucket url')
        })
    })

    it('rejects library urls', () => {
      return pb.parseUrl('http://photobucket.com/user/ww32/library/mylibrary')
        .catch((err) => {
          expect(err, 'to equal', 'Sorry, we can\'t parse library urls')
        })
    })

    it('parses direct urls', () => {
      return pb.parseUrl('http://img.photobucket.com/albums/v619/jere/garage%20journal/IMG_20150205_125121_zpsbjjagykv.jpg')
        .then((parts) => {
          expect(parts, 'to equal', {
            url: 'http://img.photobucket.com/albums/v619/jere/garage%20journal/IMG_20150205_125121_zpsbjjagykv.jpg',
            key: 'albums/v619/jere/garage journal/IMG_20150205_125121_zpsbjjagykv.jpg', album: 'v619', username: 'jere',
            filename: 'garage%20journal/IMG_20150205_125121_zpsbjjagykv.jpg',
            mediaId: 'cGF0aDpnYXJhZ2UlMjBqb3VybmFsL0lNR18yMDE1MDIwNV8xMjUxMjFfenBzYmpqYWd5a3YuanBn'
          })
        })
    })

    xit('parses media html urls', () => {
      // mock requests to pb.com
      return pb.parseUrl('http://s28.photobucket.com/user/docchaynes/media/FullSizeRender.jpg_2.jpeg.html')
        .then((parts) => {
          expect(parts, 'to equal', {
          })
        })
    })

  })

})
