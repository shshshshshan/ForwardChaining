'use-strict';
import axios from "axios";
import { v4 as uuidv4 } from "uuid";

window.onload = function () {
  let facts = []
  let rules = []

  const modal = document.querySelector('.modal')
  const addBtn = document.querySelector('.btn.colorful')
  const closeModalBtn = document.querySelector('.btn[data-action="close-modal"]')

  const addInputTabs = document.querySelectorAll('.tab-btn')
  const allTabContents = document.querySelectorAll('.tab-content')

  // Tab effects
  addInputTabs.forEach((tab, index) => {
    tab.addEventListener('click', e => {
      // Remove all other active state of tabs
      addInputTabs.forEach(tab => { tab.classList.remove('tab-active'); })
      
      tab.classList.add('tab-active')

      const line = document.querySelector('.line')
      line.style.left = e.target.offsetLeft + "px";

      allTabContents.forEach(tab => { tab.classList.remove('tab-active'); })
      allTabContents[index].classList.add('tab-active')
    })
  })

  // Show modal event
  addBtn.addEventListener('click', () => {
    modal.showModal()
  })

  // Close modal events
  const closeModal = () => {
    addInputTabs.forEach(tab => { tab.classList.remove('tab-active'); })
    addInputTabs[0].classList.add('tab-active')
    const line = document.querySelector('.line')
    line.style.left = addInputTabs[0].offsetLeft + "px";
    allTabContents.forEach(tab => { tab.classList.remove('tab-active'); })
    allTabContents[0].classList.add('tab-active')
    modal.close();
  }

  closeModalBtn.addEventListener('click', closeModal)

  modal.addEventListener('keydown', e => {
    if (e.key === 'Escape')
      closeModal();
  })

  // Adding a new fact and rule
  const factBox = document.querySelector('.facts .card-body')
  const ruleBox = document.querySelector('.rules .card-body')
  const factInput = document.querySelector('textarea#fact-entry')
  const ruleInput = document.querySelector('textarea#rule-entry')
  const addFactBtn = document.querySelector('.fact-input .btn[data-action="add"]')
  const addRuleBtn = document.querySelector('.rule-input .btn[data-action="add"]')

  const factsContent = factBox.querySelector('.facts-content')
  const factsNoContent = factBox.querySelector('.no-content')

  const rulesContent = ruleBox.querySelector('.rules-content')
  const rulesNoContent = ruleBox.querySelector('.no-content')

  // Remove a single entry
  const starClicked = e => {
    const { parentElement } = e.target

    const field = parentElement.className
    const entryId = parentElement.getAttribute('data-id')

    if (field === 'fact-entry') {
      facts = [...facts].filter(fact => fact.getAttribute('data-id') !== entryId)
    } else if (field === 'rule-entry') {
      rules = [...rules].filter(rule => rule.getAttribute('data-id') !== entryId)
    } else return

    parentElement.remove();

    if (factsContent.childElementCount === 0)
      factsNoContent.innerHTML = '<i class="fs-italic">No facts created yet</i>'
    
    if (rulesContent.childElementCount === 0)
      rulesNoContent.innerHTML = '<i class="fs-italic">No rules created yet</i>'
  }

  const addStarEventListeners = () => {
    const stars = document.querySelectorAll('span.asterisk')

    stars.forEach(star => {
      star.removeEventListener('click', starClicked)
      star.addEventListener('click', starClicked)
    })
  }

  // Add new rules and facts via input
  const addFact = e => {
    let input = factInput.value;

    if (input === '') return 

    let existent = false
    input = input.charAt(0).toUpperCase() + input.substring(1);
    facts.forEach(fact => {
      const factText = fact.innerHTML.substring(32).toLowerCase()
      if (input.toLowerCase() === factText.toLowerCase()) {
        existent = true;
        return
      }
    })

    if (existent) { 
      e.preventDefault()
      return
    }

    e.preventDefault();
    const factEntry = document.createElement('p')
    factEntry.className = "fact-entry"
    factEntry.setAttribute('data-id', uuidv4())

    const star = document.createElement('span')
    star.className = "asterisk"
    star.innerHTML = "* "

    factEntry.insertAdjacentElement('beforeend', star)
    factEntry.innerHTML += `${input}`
    factsContent.insertAdjacentElement('beforeend', factEntry)

    facts.push(factEntry)
    
    factsNoContent.innerHTML = ""
    factInput.value = "";

    addStarEventListeners()
  }

  const addRule = e => {
    let input = ruleInput.value
    
    if (input === '') return 

    input = input.charAt(0).toUpperCase() + input.substring(1);

    let existent = false

    rules.forEach(rule => {
      const ruleText = rule.innerHTML.substring(32).toLowerCase()
      if (input.toLowerCase() === ruleText.toLowerCase()) {
        existent = true;
        return
      }
    })

    if (existent) { 
      e.preventDefault()
      return
    }

    e.preventDefault();
    const ruleEntry = document.createElement('p')
    ruleEntry.className = "rule-entry"
    ruleEntry.setAttribute('data-id', uuidv4())

    const star = document.createElement('span')
    star.className = "asterisk"
    star.innerHTML = "* "

    ruleEntry.insertAdjacentElement('beforeend', star)
    ruleEntry.innerHTML += `${input}`
    rulesContent.insertAdjacentElement('beforeend', ruleEntry)

    rules.push(ruleEntry)
    
    rulesNoContent.innerHTML = ""
    ruleInput.value = "";

    addStarEventListeners()
  }

  addFactBtn.addEventListener('click', addFact)

  addRuleBtn.addEventListener('click', addRule)

  const submit = e => {
    if (e.key !== 'Enter') return 

    if (e.target.value === '') {
      e.preventDefault();
      return
    }

    const field = e.target.getAttribute('id')

    if (field === 'fact-entry')
      addFact(e)
    else if (field === 'rule-entry')
      addRule(e)
    else return
  }

  // Add input on keypress <ENTER>
  factInput.addEventListener('keydown', submit)
  ruleInput.addEventListener('keydown', submit)

  // Removing and clearing facts or inputs
  const clearFactsBtn = document.querySelector('.btn[data-action="clear-facts"]')
  const clearRulesBtn = document.querySelector('.btn[data-action="clear-rules"]')

  clearFactsBtn.addEventListener('click', () => {
    factsContent.innerHTML = "";

    factsNoContent.innerHTML = '<i class="fs-italic">No facts created yet</i>'
  })
  
  clearRulesBtn.addEventListener('click', () => {
    rulesContent.innerHTML = "";

    rulesNoContent.innerHTML = '<i class="fs-italic">No rules created yet</i>'
  })

  // Generating facts based on rules via API
  const generateBtn = document.querySelector('.btn[data-action=generate]')
  let generating = false

  generateBtn.addEventListener('click', () => {
    if (generating || facts.length === 0 || rules.length === 0) return

    generating = true
    const factStrings = [...facts].map(fact => fact.innerHTML.substring(32).toLowerCase())
    const ruleStrings = [...rules].map(rule => rule.innerHTML.substring(32).toLowerCase())

    const payload = {
      facts: factStrings,
      rules: ruleStrings
    }

    axios.post('http://127.0.0.1:5000/generate', payload)
      .then(data => {
      const { new_facts } = data.data;

      new_facts.forEach(fact => {
        let existent = false

        factStrings.forEach(string => {
          if (string === fact)
            existent = true
        })

        if (existent)
          return

        let text = fact.charAt(0).toUpperCase() + fact.substring(1);

        const factEntry = document.createElement('p')
        factEntry.className = "fact-entry"
        factEntry.setAttribute('data-id', uuidv4())
    
        const star = document.createElement('span')
        star.className = "asterisk"
        star.innerHTML = "* "
    
        factEntry.insertAdjacentElement('beforeend', star)
        factEntry.innerHTML += `${text}`
        factsContent.insertAdjacentElement('beforeend', factEntry)
    
        facts.push(factEntry)
        addStarEventListeners()
      })

      generating = false;
    }).catch(err => {
      console.error(err);
      return;
    })
  })

  // Comment/uncomment code below to disable/enable card effects
  document.querySelector('.card-container').onmousemove = e => {
    for (const card of document.getElementsByClassName("card")) {
      const rect = card.getBoundingClientRect(),
          x = e.clientX - rect.left,
          y = e.clientY - rect.top;

      card.style.setProperty("--mouse-x", `${x}px`)
      card.style.setProperty("--mouse-y", `${y}px`)
    }
  }
}