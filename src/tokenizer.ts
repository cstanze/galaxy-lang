import { Many as LodashMany, PropertyName as LodashPropertyName, set as lodashSet, get as lodashGet } from 'lodash'

export const TokenPattern = {
  tag: new RegExp(`[^$\\^\\s]+:`),
  section: new RegExp(`\\$.+:`),
  text: new RegExp(`\".*\"`),
  num: new RegExp(`\\d+`),
  constants: new RegExp(`nil|true|false`)
}

interface TokenMap {
  [key: string]: any
}

export class GalaxyTokenizer {
  contents: string
  private _tokens: Array<string>
  private _tokenMap: TokenMap
  private _debug: boolean

  constructor(contents: string, debug: boolean = false) {
    this.contents = contents
    this._debug = debug
    this._tokens = []
    this._tokenMap = {}

    this.log(`constructed with contents of length: ${contents.length}`)
  }

  get tokens() {
    if(!this._tokens.length) {
      this._tokens = this.contents.split(/\s+/)
    }

    return this._tokens
  }

  get tokenMap() {
    if(!Object.keys(this._tokenMap).length) {
      this.parseTokens()
    }

    return this._tokenMap
  }

  // TODO: fix these stats
  // get tokenStats() {
  //   const constants = this.contents.match(TokenPattern.constants)?.length
  //   const sections = this.contents.match(TokenPattern.section)?.length
  //   const numbers = this.contents.match(TokenPattern.num)?.length
  //   const text = this.contents.match(TokenPattern.text)?.length
  //   const tags = this.contents.match(TokenPattern.tag)?.length

  //   return {
  //     constants,
  //     sections,
  //     numbers,
  //     text,
  //     tags
  //   }
  // }

  private parseTokens() {
    if(!this._tokens.length) {
      this._tokens = this.contents.split(/\s+/)
    }
    let keyBuffer = ""
    let stringBuffer = ""
    let didJustAddToStringBuffer = false
    let withinSection = false
    let inComment = false

    for(const token of this._tokens) {
      if(token == '') continue
      switch(token[token.length - 1]) {
        case ':':
          // figure out if its a array item
          if(inComment)
            break
          if((token[0] == '$' || withinSection) && !['galaxy_name:', 'stars:', 'planets:'].includes(token)) {
            if(token[0] == '$') {
              let sectorKey = token.replace(/\$|:/g, '')
              if(!isNaN(Number(sectorKey))) {
                if(lodashGet(this._tokenMap, keyBuffer) === undefined)
                  keyBuffer += `[${sectorKey}]`
                else {
                  let kbufTemp = keyBuffer.split('.')[0].replace(/\[\d+\]/g, '')
                  kbufTemp += `[${sectorKey}]`
                  keyBuffer = kbufTemp
                }
              } else {
                if(lodashGet(this._tokenMap, keyBuffer) === undefined)
                  keyBuffer += `.${sectorKey}`
                else {
                  let kbufTemp = keyBuffer.split('.')
                  kbufTemp.pop()
                  keyBuffer = kbufTemp.join('.')
                  keyBuffer += `.${sectorKey}`
                }
              }
              withinSection = true
            } else {
              if(lodashGet(this._tokenMap, keyBuffer) === undefined)
                keyBuffer += `.${token.replace(/:/g, '')}`
              else {
                let kbufTemp = keyBuffer.split('.')
                kbufTemp.pop()
                keyBuffer = kbufTemp.join('.')
                keyBuffer += `.${token.replace(/:/g, '')}`
              }
            }
          } else {
            switch(token) {
              case 'galaxy_name:':
                keyBuffer = "galaxy_name"
                break
              case 'stars:':
                keyBuffer = "stars"
                break
              case 'planets:':
                keyBuffer = "planets"
                break
              default:
                throw new Error(`unidentified key '${token}'`)
            }
            withinSection = false
          }
          break
        case '%':
          inComment = false
          break
        case '"':
          // close string
          if(inComment)
            break
          if(didJustAddToStringBuffer) {
            stringBuffer += ` ${token.replace(/"/g, '')}`
            this.assignToTokenMap(keyBuffer, stringBuffer)
            stringBuffer = ""
            didJustAddToStringBuffer = false
          }
          // new string
          if(token[0] == '"')
            this.assignToTokenMap(keyBuffer, token.replace(/"/g, ''))
          break
        default:
          if(token[0] == '%') {
            inComment = true
            break
          } else if(inComment)
            break
          else if(token[0] == '"') {
            stringBuffer = token.replace(/"/g, '')
            didJustAddToStringBuffer = true
          } else if(keyBuffer.length && !isNaN(Number(token)))
            this.assignToTokenMap(keyBuffer, Number(token))
          else if(didJustAddToStringBuffer)
            stringBuffer += token
          else if(keyBuffer.length) {
            console.log(token)
            switch(token) {
              case 'true':
                this.assignToTokenMap(keyBuffer, true)
                break
              case 'false':
                this.assignToTokenMap(keyBuffer, false)
                break
              case 'nil':
                this.assignToTokenMap(keyBuffer, null)
                break
              default:
                throw new Error(`Unknown Token '${token}'`)
            }
          }
          break
      }
      this.log(`token = '${token}'`)
      this.log(`set keyBuffer = '${keyBuffer}'`)
      this.log(`set stringBuffer = '${stringBuffer}'`)
      this.log(`set didJustAddToStringBuffer = ${didJustAddToStringBuffer}`)
      this.log(`set withinSection = ${withinSection}`)
      this.log(`set tokenMap = ${this.inspect(this._tokenMap)}\n\n`)
    }
  }

  private assignToTokenMap(key: LodashMany<LodashPropertyName>, data: any) {
    this._tokenMap = lodashSet(this._tokenMap, key, data)
  }

  private inspect(obj: any): string {
    return require('util').inspect(obj, true, Infinity, true)
  }

  private log(content: string, ...optionalParams: any[]) {
    const time = new Date(Date.now())
    const formattedTime = `${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}`
    if(this._debug)
      console.log(`${formattedTime} [GalaxyTokenizer] ${content}`, ...optionalParams)
  }
}

