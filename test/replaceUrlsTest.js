const expect = require('unexpected')
const replaceUrls = require('../lib/replaceUrls')

describe('replaceUrls', () => {
  it('replaces all urls in text', () => {
    const originalUrls = [
      'http://i100.photobucket.com/albums/m29/flatfourfan/My%20Bus/DSC04078.jpg',
      'http://i100.photobucket.com/albums/m29/flatfourfan/My%20Bus/DSC04079.jpg'
    ]
    const nextUrls = [
      'http://example.com/albums/m29/flatfourfan/My%20Bus/DSC04078.jpg',
      'http://example.com/albums/m29/flatfourfan/My%20Bus/DSC04079.jpg'
    ]
    const text = `
    <r><IMG src="http://i100.photobucket.com/albums/m29/flatfourfan/My%20Bus/DSC04078.jpg"><s>[img]</s><URL url="http://i100.photobucket.com/albums/m29/flatfourfan/My%20Bus/DSC04078.jpg"><LINK_TEXT text="http://i100.photobucket.com/albums/m29/ ... C04078.jpg">http://i100.photobucket.com/albums/m29/flatfourfan/My%20Bus/DSC04078.jpg</LINK_TEXT></URL><e>[/img]</e></IMG><br/>
    <br/>
    <IMG src="http://i100.photobucket.com/albums/m29/flatfourfan/My%20Bus/DSC04079.jpg"><s>[img]</s><URL url="http://i100.photobucket.com/albums/m29/flatfourfan/My%20Bus/DSC04079.jpg"><LINK_TEXT text="http://i100.photobucket.com/albums/m29/ ... C04079.jpg">http://i100.photobucket.com/albums/m29/flatfourfan/My%20Bus/DSC04079.jpg</LINK_TEXT></URL><e>[/img]</e></IMG><br/>
    <br/>
    It's a VDO unit by the way</r>
    `
    const expectedText = `
    <r><IMG src="http://example.com/albums/m29/flatfourfan/My%20Bus/DSC04078.jpg"><s>[img]</s><URL url="http://example.com/albums/m29/flatfourfan/My%20Bus/DSC04078.jpg"><LINK_TEXT text="http://i100.photobucket.com/albums/m29/ ... C04078.jpg">http://example.com/albums/m29/flatfourfan/My%20Bus/DSC04078.jpg</LINK_TEXT></URL><e>[/img]</e></IMG><br/>
    <br/>
    <IMG src="http://example.com/albums/m29/flatfourfan/My%20Bus/DSC04079.jpg"><s>[img]</s><URL url="http://example.com/albums/m29/flatfourfan/My%20Bus/DSC04079.jpg"><LINK_TEXT text="http://i100.photobucket.com/albums/m29/ ... C04079.jpg">http://example.com/albums/m29/flatfourfan/My%20Bus/DSC04079.jpg</LINK_TEXT></URL><e>[/img]</e></IMG><br/>
    <br/>
    It's a VDO unit by the way</r>
    `

    expect(replaceUrls(text, originalUrls, nextUrls), 'to equal', expectedText)
  })
})
