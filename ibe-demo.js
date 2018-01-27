function getValue (name) { return document.getElementsByName(name)[0].value }
function setValue (name, val) { document.getElementsByName(name)[0].value = val }
function getText (name) { return document.getElementsByName(name)[0].innerText }
function setText (name, val) { document.getElementsByName(name)[0].innerText = val }

function loadScript (url, callback) {
  const script = document.createElement('script')
  script.type = 'text/javascript'
  script.src = url
  if (script.readyState) {
    script.onreadystatechange = () => {
      if (script.readyState === 'loaded' || script.readyState === 'complete') {
        script.onreadystatechange = null
        callback()
      }
    }
  } else {
    script.onload = () => callback()
  }
  document.getElementsByTagName('head')[0].appendChild(script)
}

let prevSelectedCurve = 0
loadScript('./mcl_c.js', () => {
  setText('browser', navigator.userAgent)
  mcl.init(prevSelectedCurve).then(() => {
    setText('status', 'ok')
  })
})

function onChangeSelectCurve () {
  const obj = document.selectCurve.curveType
  const idx = obj.selectedIndex
  const curveType = obj.options[idx].value | 0
  if (curveType === prevSelectedCurve) return
  prevSelectedCurve = curveType
  const srcName = curveType === 0 ? './mcl_c.js' : './mcl_c512.js'
  console.log(`srcName=${srcName}`)
  loadScript(srcName, () => {
    mcl.init(curveType).then(() => {
      setText('status', `curveType=${curveType} status ok`)
    })
  })
}

// Enc(m) = [r P, m + h(e(r mpk, H(id)))]
function IDenc (id, P, mpk, m) {
  const r = new mcl.Fr()
  r.setByCSPRNG()
  const Q = mcl.hashAndMapToG2(id)
  const e = mcl.pairing(mcl.mul(mpk, r), Q)
  return [mcl.mul(P, r), mcl.add(m, mcl.hashToFr(e.serialize()))]
}

// Dec([U, v]) = v - h(e(U, sk))
function IDdec (c, sk) {
  const [U, v] = c
  const e = mcl.pairing(U, sk)
  return mcl.sub(v, mcl.hashToFr(e.serialize()))
}

function onClickIBE () {
  const P = mcl.hashAndMapToG1('1')
  // keyGen
  const msk = new mcl.Fr()
  msk.setByCSPRNG()
  setText('msk', msk.serializeToHexStr())
  // mpk = msk P
  const mpk = mcl.mul(P, msk)
  setText('mpk', mpk.serializeToHexStr())

  // user KeyGen
  const id = getText('id')
  // sk = msk H(id)
  const sk = mcl.mul(mcl.hashAndMapToG2(id), msk)
  setText('sk', sk.serializeToHexStr())

  const m = new mcl.Fr()
  const msg = getValue('msg')
  console.log('msg', msg)
  m.setStr(msg)

  // encrypt
  const c = IDenc(id, P, mpk, m)
  setText('enc', c[0].serializeToHexStr() + ' ' + c[1].serializeToHexStr())
  // decrypt
  const d = IDdec(c, sk)
  setText('dec', d.getStr())
}

function bench (label, count, func) {
  const start = Date.now()
  for (let i = 0; i < count; i++) {
    func()
  }
  const end = Date.now()
  const t = (end - start) / count
  setText(label, t)
}

function benchAll () {
  const a = new mcl.Fr()

  const msg = 'hello wasm'

  a.setByCSPRNG()
  let P = mcl.hashAndMapToG1('abc')
  let Q = mcl.hashAndMapToG2('abc')
  const P2 = mcl.hashAndMapToG1('abce')
  const Q2 = mcl.hashAndMapToG2('abce')
  const Qcoeff = new mcl.PrecomputedG2(Q)
  const e = mcl.pairing(P, Q)

  console.log('benchmark')
  const C = 100
  bench('T_Fr::setByCSPRNG', C, () => a.setByCSPRNG())
  bench('T_pairing', C, () => mcl.pairing(P, Q))
  bench('T_millerLoop', C, () => mcl.millerLoop(P, Q))
  bench('T_finalExp', C, () => mcl.finalExp(e))
  bench('T_precomputedMillerLoop', C, () => mcl.precomputedMillerLoop(P, Qcoeff))
  bench('T_G1::add', C, () => { P = mcl.add(P, P2) })
  bench('T_G1::dbl', C, () => { P = mcl.dbl(P) })
  bench('T_G1::mul', C, () => { P = mcl.mul(P, a) })
  bench('T_G2::add', C, () => { Q = mcl.add(Q, Q2) })
  bench('T_G2::dbl', C, () => { Q = mcl.dbl(Q) })
  bench('T_G2::mul', C, () => { Q = mcl.mul(Q, a) })
  bench('T_hashAndMapToG1', C, () => mcl.hashAndMapToG1(msg))
  bench('T_hashAndMapToG2', C, () => mcl.hashAndMapToG2(msg))

  Qcoeff.destroy()
}
