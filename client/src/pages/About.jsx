import React from "react";

export default function About() {
  return (
    <div className="page-content">
      <section className="page-header">
        <h1>Sobre Nós</h1>
        <p className="page-header-subtitle">
          Conheça mais sobre o YT Conversor e nossa missão.
        </p>
      </section>

      <div className="about-container">
        <div className="about-section">
          <h2>Nossa Missão</h2>
          <div className="about-block">
            <p>
              O YT Conversor foi criado com um objetivo simples: oferecer a
              maneira mais rápida, segura e fácil de converter vídeos do YouTube
              para formatos MP3 e MP4. Acreditamos que o acesso ao conteúdo de
              áudio e vídeo deve ser simples e sem complicações.
            </p>
          </div>
        </div>

        <div className="about-section">
          <h2>O Que Fazemos</h2>
          <div className="about-block">
            <h3>⚡ Conversão Instantânea</h3>
            <p>
              Nossa plataforma utiliza tecnologia de ponta para processar e
              converter vídeos em segundos, garantindo que você não perca tempo
              esperando.
            </p>
          </div>
          <div className="about-block">
            <h3>🎵 Qualidade Superior</h3>
            <p>
              Priorizamos a qualidade do áudio e vídeo. Todos os arquivos são
              extraídos na maior taxa de bits disponível para garantir a melhor
              experiência possível.
            </p>
          </div>
          <div className="about-block">
            <h3>🔒 Privacidade e Segurança</h3>
            <p>
              Sua privacidade é nossa prioridade. Não armazenamos dados pessoais
              e todos os arquivos convertidos são excluídos automaticamente após
              o download.
            </p>
          </div>
        </div>

        <div className="about-section">
          <h2>Por Que Nos Escolher?</h2>
          <div className="about-block">
            <ul>
              <li>100% gratuito — sem taxas ocultas</li>
              <li>Sem necessidade de cadastro ou login</li>
              <li>Suporte para formatos MP3 e MP4</li>
              <li>Interface simples e intuitiva</li>
              <li>Compatível com todos os dispositivos</li>
              <li>Sem anúncios invasivos ou popups</li>
            </ul>
          </div>
        </div>

        <div className="about-section">
          <h2>Nossa Equipe</h2>
          <div className="about-block">
            <p>
              Somos uma equipe apaixonada por tecnologia e comprometida em
              oferecer ferramentas úteis e acessíveis para todos. Estamos
              constantemente trabalhando para melhorar o YT Conversor e
              adicionar novos recursos.
            </p>
            <p>
              Se você tiver sugestões, dúvidas ou feedback, não hesite em entrar
              em contato conosco. Sua opinião é muito importante para nós!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
