# LivroJá — Site de demonstração

Este site responsivo foi desenvolvido com base no documento **Plano Detalhado LivroJá**. Funciona em computadores e telemóveis; não requer instalação de Node.js, base de dados ou servidor próprio.

## O que está implementado
- Página inicial e apresentação do serviço.
- Biblioteca de **exemplos** de materiais, com pesquisa por texto, classe e disciplina.
- Preços de teste e explicações sobre os serviços.
- Mercado escolar com **anúncios demonstrativos**.
- Formulário de pedidos que prepara uma mensagem. Após configurar o WhatsApp oficial, o botão abre a conversa com a mensagem preparada. Sem WhatsApp configurado, é possível copiar a mensagem.
- Página de perguntas frequentes, avisos de segurança e privacidade.

**Limitação:** esta é uma versão estática do site. Não existe registo de utilizadores, painel de administração, pagamentos automáticos, base de dados, armazenamento de pedidos ou envio automático de mensagens. Não se deve prometer essas funcionalidades até serem desenvolvidas. Os materiais do catálogo não incluem ficheiros PDF de estudo e os anúncios não correspondem a vendas reais.

## Como abrir no teu computador
Abre `index.html` no Chrome, Edge ou outro navegador. É necessário acesso à internet apenas para carregar as fontes opcionais.

## Como publicar para aceder a partir de outros computadores
### Opção A — Netlify Drop (mais simples)
1. Cria uma conta gratuita em https://app.netlify.com/ .
2. Abre https://app.netlify.com/drop .
3. Descompacta o ZIP e arrasta a **pasta `livroja-site`** (com `index.html` dentro) para a área de publicação.
4. A plataforma gera um endereço público terminado em `.netlify.app`. Abre esse endereço em outro computador ou telemóvel com internet.
5. Sempre que alterares os ficheiros, publica novamente a pasta, no projecto certo.

### Opção B — GitHub Pages
1. Cria um repositório GitHub público com os ficheiros do site na raiz.
2. Acede a Settings → Pages → Build and deployment → Deploy from a branch.
3. Escolhe a branch `main`, pasta `/ (root)` e guarda.
4. Quando a publicação terminar, abre o endereço apresentado em Settings → Pages.

## WhatsApp de suporte configurado
O atendimento está associado ao número **+258 87 694 7422** (`258876947422`). Os pedidos preparados pelo formulário podem ser enviados para este contacto.

## Configurar o WhatsApp oficial
Edita `config.js` e substitui `whatsapp: ""` pelo número **oficial e autorizado** da equipa, no formato `258XXXXXXXXX` (indicativo de Moçambique, sem `+`, espaços ou hífens). Não uses números inventados. Por exemplo, a estrutura é:

```javascript
window.LIVROJA_CONFIG = { whatsapp: "258XXXXXXXXX", email: "" };
```

O exemplo acima mostra apenas o formato; é necessário um contacto verdadeiro. Ao enviar o formulário, o utilizador é encaminhado ao WhatsApp, onde decide se envia a mensagem. **Nada é guardado no servidor do site.**

## Substituir conteúdo demonstrativo
- Abre `script.js` e altera o array `materials` para as fichas efectivamente revistas e aprovadas.
- Altera os anúncios ilustrativos no bloco `#mercado` de `index.html` só quando existirem anúncios autorizados.
- As fichas do exemplo não estão disponíveis para transferência. Adiciona apenas ficheiros próprios ou cuja publicação seja autorizada.
- Confirma preços, pagamentos e prazos com os alunos antes de os anunciar como definitivos.

## Segurança e privacidade
Nunca peças PIN, palavra-passe ou código de confirmação. Não publiques contactos pessoais de alunos nem moradas sem autorização. No caso de menores, envolve os encarregados de educação quando necessário. O formulário não pede números de telefone nem guarda pedidos na página.
