import { text } from "./../dist"

describe('walrus', () => {
  describe('text', () => {
    describe('addBefore', () => {
      it('new prefix', () => {
        expect(text.addBefore('finders keepers', 'losers weepers')).toBe('losers weepersfinders keepers');
      })

      it('same prefix', () => {
        expect(text.addBefore('abcde', 'abc')).toBe('abcde')
      })

    })
    describe('addAfter', () => {
      it('new suffix', () => {
        expect(text.addAfter('finders keepers', 'losers weepers')).toBe('finders keeperslosers weepers')
      })
      it('same suffix', () => {
        expect(text.addAfter('abcde', 'cde')).toBe('abcde')

      })

    })

  })

  it('ucFirst', () => {
    expect(text.capFirst('phrase')).toBe('Phrase')
    expect(text.capFirst('101 dalmatians')).toBe('101 Dalmatians')
  })
})
