import { createTransport } from 'nodemailer';

const transporter = createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_ACCOUNT,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendFirstAccessEmail(
  username: string,
  usermail: string,
  tempPassword: string,
): Promise<boolean> {
  const info = await transporter.sendMail({
    from: 'Obralog <obralog.sac@gmail.com>',
    to: usermail,
    subject: 'Acesso ao sistema - senha temporária',
    html: `
      <p>Olá, ${username}!</p>
      <p>Você foi cadastrado no nosso sistema de SAC Obralog. Use a senha temporária abaixo para fazer login e redefinir sua senha:</p>
      <p><strong>Senha temporária:</strong> ${tempPassword}</p>
      <p><a href="${process.env.CORS_ALLOWED_ORIGIN}/pages/auth">Clique aqui para acessar</a></p>
    `,
  });
  console.log(info.messageId);
  return !!info.messageId;
}

export async function sendComplaintUpdateEmail(
  ownerName: string,
  ownerEmail: string,
  status: string,
  complaintId: string,
  extraInfo?: string,
): Promise<boolean> {
  console.log('\n disparou o ', ownerName);
  const statusMessages: Record<string, string> = {
    EM_ANALISE: 'Sua reclamação foi colocada em análise',
    VISITA_AGENDADA: 'Uma visita técnica foi agendada',
    AGUARDANDO_FEEDBACK: 'Estamos aguardando o seu feedback',
    FECHADO: 'A reclamação foi encerrada',
  };

  const info = await transporter.sendMail({
    from: 'Obralog <obralog.sac@gmail.com>',
    to: ownerEmail,
    subject: `Atualização da sua reclamação nº ${complaintId}`,
    html: `
      <p>Olá, <strong>${ownerName}</strong>!</p>
      <p>${statusMessages[status] || 'Status atualizado'}.</p>

      ${
        extraInfo
          ? `<p>Informações adicionais:</p><p><strong>${extraInfo}</strong></p>`
          : ''
      }

      <p>Para acompanhar sua reclamação, acesse:</p>
      <p><a href="${process.env.CORS_ALLOWED_ORIGIN}/pages/feedback/${complaintId}">
        Clique aqui para visualizar
      </a></p>

      <br />
      <p>Atenciosamente,<br/>Equipe Obralog</p>
    `,
  });

  console.log('Email enviado:', info.messageId);
  return !!info.messageId;
}
