let isIgnite = true

const changeCard = e => {
    const card = e.target
    const bg = isIgnite ? 'explorer' : 'ignite'
    isIgnite = !isIgnite
    card.style.backgroundImage = `url(./assets/bg-${bg}.svg)`
}