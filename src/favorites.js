import { GithubUser } from "./GithubUser.js"

export class Favorites {
  constructor(root) {
    this.root = document.querySelector(root)
    this.load()
    this.checkEmpty()
  }

  load() {
    this.entries = JSON.parse(localStorage.getItem('@github-favorites:')) || []
  }

  save() {
    localStorage.setItem('@github-favorites:', JSON.stringify(this.entries))
  }

  async add(username) {
    try {
      const repeatedUser = this.entries.find(user => user.login === username)

      if (repeatedUser) {
        throw new Error('User already registrated.')
      }

      const user = await GithubUser.search(username)
      if (user.login === undefined) {
        throw new Error('Username not found.')
      }

      this.entries = [user, ...this.entries]
      this.save()
      this.update()
      this.checkEmpty()

    } catch(error) {
      alert(error.message)
    }
  }

  delete(user) {
    const filteredEntries = this.entries.filter(entry => entry.login !== user.login)
    this.entries = filteredEntries

    this.save()
    this.update()
    this.checkEmpty()
  }

  checkEmpty() {
    const emptyDisplay = document.querySelector('.empty')

    if (this.entries.length > 0) {
      emptyDisplay.classList.add('hide')
      return
    }

    emptyDisplay.classList.remove('hide')
  }
}

export class FavoritesView extends Favorites {
  constructor(root) {
    super(root)

    this.tbody = this.root.querySelector('table tbody')

    this.update()
    this.onadd()
  }
  
  onadd() {
    const addButton = this.root.querySelector('.search button')
    addButton.onclick = () => {
      const { value } = this.root.querySelector('.search input')
      this.add(value)
    }
    
    window.onkeydown = (event) => {
      const { value } = this.root.querySelector('.search input')
      const keyPressed = event.code
      if (keyPressed === 'Enter') {
        this.add(value)
      }
    }
  }

  update() {
    this.removeAllTr()

    this.entries.forEach(user => {
      const row = this.createRow()
      row.querySelector('.user img').src = `https://github.com/${user.login}.png`
      row.querySelector('.user img').alt = `Image of ${user.name}`
      row.querySelector('.user p').textContent = user.name
      row.querySelector('.user span').textContent = `/${user.login}`
      row.querySelector('.user a').href = `https://github.com/${user.login}`
      row.querySelector('.repositories').textContent = user.public_repos
      row.querySelector('.followers').textContent = user.followers
      row.querySelector('.remove').onclick = () => {
        const isOk = confirm('Are you sure you want to delete this user?')
        if (isOk) {
          this.delete(user)
        }
      }

      this.tbody.append(row)
    })
  }

  createRow() {
    const tr = document.createElement('tr')

    tr.innerHTML = `
      <td class="user">
        <img src="https://github.com/demon1094.png">
        <a href="https://github.com/demon1094" target="_blank">
          <p>Diego Araujo</p>
          <span>/demon1094</span>
        </a>
      </td>
      <td class="repositories">
        20
      </td>
      <td class="followers">
        11
      </td>
      <td>
        <button class="remove">Remove</button>
      </td>
    `

    return tr
  }

  removeAllTr() {
    this.tbody.querySelectorAll('tr').forEach((tr) => {
      tr.remove()
    })
  }
}