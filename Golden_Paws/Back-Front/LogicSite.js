

// Configurações e estado global

const LS_ANIMAIS = 'animaisCadastrados';
let animalParaAdotar = null;





function escapeHtml(str = '') {
  return String(str).replace(/[&<>"']/g, s => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[s]);
}



function showToast(msg, tipo = 'info') {
  let toast = document.createElement('div');
  toast.className = `toast ${tipo}`;
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add('ativo'), 50);
  setTimeout(() => {
    toast.classList.remove('ativo');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}



// Persistência (localStorage)

function getAnimais() {
  try {
    const data = localStorage.getItem(LS_ANIMAIS);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Erro ao ler animais do localStorage:", e);
    return [];
  }
}

function setAnimais(animais) {
  localStorage.setItem(LS_ANIMAIS, JSON.stringify(animais));
}

function resetAnimais(confirmPrompt = true) {
  try {
    if (confirmPrompt) {
      const confirmado = confirm('Deseja realmente limpar todos os animais cadastrados? Esta ação não pode ser desfeita.');
      if (!confirmado) return;
    }


    setAnimais([]);

    try {
      renderizarAnimais();
    } catch (e) {

      console.warn('renderizarAnimais não disponível ao chamar resetAnimais:', e);
    }

    showToast('Todos os animais foram removidos.', 'info');
  } catch (err) {
    console.error('Erro ao resetar animais:', err);
    showToast('Ocorreu um erro ao limpar os animais.', 'erro');
  }
}



// Validações de formulário

function validarEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validarFormulario() {
  const file = document.getElementById("inputFile")?.files?.[0];
  const nome = document.getElementById("nomeAnimal")?.value.trim();

  const especie = document.getElementById("especie")?.value.trim();
  const descricao = document.getElementById("descricaoAnimal")?.value.trim();
  const email = document.getElementById("emailContato")?.value.trim();

  if (!file || !nome || !especie || !descricao || !email) {
    showToast("Preencha todos os campos e selecione uma imagem.", "erro");
    return false;
  }
  if (!validarEmail(email)) {
    showToast("Digite um email válido.", "erro");
    return false;
  }
  return true;
}



// Renderização dos cards de animais

function renderizarAnimais() {
  const disponiveisContainer = document.getElementById("animaisDisponiveis");
  const adotadosContainer = document.getElementById("animaisAdotadosMenu3");

  if (!disponiveisContainer && !adotadosContainer) return;

  const todosAnimais = getAnimais();
  const animaisDisponiveis = todosAnimais.filter(a => !a.adotado);
  const animaisAdotados = todosAnimais.filter(a => a.adotado);


  if (disponiveisContainer) {
    disponiveisContainer.innerHTML = '';
    const placeholder = document.getElementById('placeholder-sem-animais');
    if (animaisDisponiveis.length === 0) {
      if (placeholder) placeholder.style.display = 'block';
    } else {
      if (placeholder) placeholder.style.display = 'none';
      animaisDisponiveis.forEach(animal => {
        disponiveisContainer.appendChild(criarCardAnimal(animal, false));
      });
    }
  }


  if (adotadosContainer) {
    adotadosContainer.innerHTML = '';
    if (animaisAdotados.length === 0) {
      adotadosContainer.innerHTML = '<p style="text-align:center;">Ainda não há animais registrados como adotados.</p>';
    } else {
      animaisAdotados.forEach(animal => {
        adotadosContainer.appendChild(criarCardAnimal(animal, true));
      });
    }
  }
}

let joinha = 0;

function DarJoinha() {
  
  joinha += 1;
  document.getElementById("joinhaConter").innerHTML = `<p>👍${joinha}</p>`;
}

// Criação dos cards dos bixo
function criarCardAnimal(animal, isAdotado) {
  const card = document.createElement("section");
  card.classList.add("card");
  card.setAttribute('data-id', animal.id);

  let htmlAdocao = '';
  if (isAdotado) {
    htmlAdocao = `
      <p class="data-adocao">
        <strong>Adotado por:</strong> ${escapeHtml(animal.adotante.nome)}<br>
        <strong>Email:</strong> ${escapeHtml(animal.adotante.email)}<br>
        <strong>Data de adoção:</strong> ${animal.adotante.data}
        
      </p>
    `;
  } else {
    htmlAdocao = `
      <button class="adotado-btn" aria-label="Adotar ${escapeHtml(animal.nome)}">Adotar</button>
      <button class="expand-btn" aria-expanded="false">Ver mais</button>
    `;
  }

  card.innerHTML = `
    <div class="card-media">
      <img src="${animal.imagemBase64}" alt="${escapeHtml(animal.nome)}" class="card-image" />
    </div>
    <div class="card-body">
      <h3>${escapeHtml(animal.nome)} (${escapeHtml(animal.especie)})</h3>
      <p class="card-info">
        ${escapeHtml(animal.descricao)}<br>
        <strong>Sexo:</strong> ${escapeHtml(animal.sexo)}<br>
        <strong>Vacinas:</strong> ${escapeHtml(animal.vacinas.length ? animal.vacinas.join(', ') : 'Nenhuma informada')}<br>
        <strong>Contato do Doador:</strong> ${escapeHtml(animal.emailDoador)}<br>
      </p>
      ${htmlAdocao}
    </div>
  `;
  return card;
}




document.addEventListener('DOMContentLoaded', () => {

  if (document.getElementById("animaisDisponiveis") || document.getElementById("animaisAdotadosMenu3")) {
    renderizarAnimais();
  }


  document.querySelectorAll('.logo').forEach(logoEl => {
    logoEl.addEventListener('click', (ev) => {

      ev.preventDefault?.();
      resetAnimais(true);
    });
  });


  const inputFile = document.getElementById('inputFile');
  const imagemPreview = document.getElementById('imagemPreview');
  if (inputFile) {
    inputFile.addEventListener('change', e => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = e => {
          imagemPreview.src = e.target.result;
          imagemPreview.style.display = 'block';
        };
        reader.readAsDataURL(file);
      } else {
        imagemPreview.style.display = 'none';
      }
    });
  }


  const menuMob = document.getElementById('menuMob');
  const overlay = document.getElementById('overlay');

  const form = document.getElementById("formDoacao");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!validarFormulario()) return;

      const file = inputFile.files[0];
      const nome = document.getElementById("nomeAnimal").value.trim();

  const especie = document.getElementById("especie").value.trim();
      const descricao = document.getElementById("descricaoAnimal").value.trim();
      const emailDoador = document.getElementById("emailContato").value.trim();
  const sexo = document.getElementById("sexoAnimal")?.value || "Indefinido";

  const vacinas = Array.from(document.querySelectorAll('#formDoacao input[type="checkbox"]:checked')).map(n => n.value);

      const reader = new FileReader();
      reader.onload = (event) => {
        const imagemBase64 = event.target.result;
        const novoAnimal = {
          id: Date.now(),
          nome,
          especie,
          descricao,
          emailDoador,
          sexo,
          vacinas,
          imagemBase64,
          adotado: false
        };
        const animais = getAnimais();
        animais.push(novoAnimal);
        setAnimais(animais);

        showToast(`O animal ${nome} foi cadastrado com sucesso!`, "sucesso");
        form.reset();
        imagemPreview.style.display = "none";
        setTimeout(() => window.location.href = 'Adote.html', 1000);
      };
      reader.readAsDataURL(file);
    });
  }

  // Clique: Adotar / Expandir
  document.addEventListener("click", (e) => {
    const target = e.target;

    if (target.classList.contains("adotado-btn")) {
      const card = target.closest(".card");
      if (!card) return;
      animalParaAdotar = card.getAttribute('data-id');
      document.getElementById("formAdocao")?.classList.add("ativo");

      overlay?.classList.add('ativo');
    }

    if (target.classList.contains("expand-btn") || target.classList.contains("card-image")) {
      const card = target.closest('.card');
      const info = card?.querySelector('.card-info');
      const btn = card?.querySelector('.expand-btn');
      if (info && btn) {
        info.classList.toggle('expandido');
        btn.textContent = info.classList.contains('expandido') ? 'Ver menos' : 'Ver mais';
      }
    }
  });

  // Confirmar adoção
  const confirmarBtn = document.getElementById("confirmarAdocaoBtn");
  if (confirmarBtn) {
    confirmarBtn.addEventListener("click", () => {
      const nome = document.getElementById("nomeInteresse")?.value.trim();

     
      if (!nome) return showToast("Preencha seu nome para confirmar a adoção.", "erro");

      const animais = getAnimais();
      const index = animais.findIndex(a => String(a.id) === String(animalParaAdotar));
      if (index !== -1) {
        animais[index].adotado = true;
        
        animais[index].adotante = { nome, email: '', data: new Date().toLocaleDateString('pt-BR') };
        setAnimais(animais);
      }

      document.getElementById("formAdocao")?.classList.remove("ativo");
      document.getElementById("nomeInteresse").value = '';

  overlay?.classList.remove('ativo');
      animalParaAdotar = null;

      showToast("Animal adotado com sucesso! ❤️", "sucesso");
      setTimeout(() => window.location.href = 'Adotado.html', 1200);
    });
  }

  // Cancelar adoção
  document.getElementById("cancelarAdocaoBtn")?.addEventListener("click", () => {
    document.getElementById("formAdocao")?.classList.remove("ativo");
    document.getElementById("nomeInteresse").value = '';
    overlay?.classList.remove('ativo');
    animalParaAdotar = null;
  });

  // Menu mobile
  window.MenuMenu = function () {
    if (menuMob && overlay) {
      const isAtivo = menuMob.classList.toggle('ativo');
      overlay.classList.toggle('ativo', isAtivo);
    }
  };
});


