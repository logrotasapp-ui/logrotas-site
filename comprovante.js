// comprovante.js — gerador do comprovante LogRotas em PDF (jsPDF)
(function () {
  const brl = v => "R$ " + Number(v || 0).toFixed(2).replace(".", ",");
  function fmtData(iso) {
    if (!iso) return "—";
    let d;
    if (iso instanceof Date) d = iso;
    else { const s = String(iso); d = new Date(s.length <= 10 ? s + "T00:00:00" : s); }
    if (isNaN(d)) return "—";
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    return `${dd}/${mm}/${d.getFullYear()}`;
  }
  const fmtHora = d => String(d.getHours()).padStart(2,"0") + ":" + String(d.getMinutes()).padStart(2,"0");
  const ehCartao = d => !!(d.bandeira && d.ultimos4);
  const linhaCartao = d => ehCartao(d) ? `${d.bandeira} •••• ${d.ultimos4}` : "—";

  function gerarComprovantePDF(dados) {
    const JsPDF = (window.jspdf && window.jspdf.jsPDF) || window.jsPDF;
    if (!JsPDF) { alert("Biblioteca de PDF não carregou. Recarregue a página."); return; }
    const temTel = !!dados.telefonePagador;
    const doc = new JsPDF({ unit: "mm", format: [148, temTel ? 240 : 232] });
    const W = 148, M = 14, cx = W / 2;
    const navy=[21,34,74], orange=[240,100,30], green=[30,158,90],
          muted=[107,114,128], line=[230,232,238], soft=[244,247,251];

    doc.setFillColor(...navy); doc.rect(0,0,W,38,"F");
    doc.setFont("helvetica","bold"); doc.setFontSize(22);
    doc.setTextColor(255,255,255); doc.text("Log", cx-12, 20, {align:"right"});
    doc.setTextColor(...orange);    doc.text("Rotas", cx-12, 20, {align:"left"});
    doc.setFont("helvetica","normal"); doc.setFontSize(9.5);
    doc.setTextColor(170,179,204); doc.text("logrotas.com.br", cx, 29, {align:"center"});

    let y = 50;
    doc.setFillColor(...green); doc.circle(cx-30, y-1.4, 1.3, "F");
    doc.setFont("helvetica","bold"); doc.setFontSize(11); doc.setTextColor(...green);
    doc.text("Pagamento confirmado", cx-26, y, {align:"left"});
    y += 8;
    doc.setFontSize(15); doc.setTextColor(...navy);
    doc.text("Comprovante de Pagamento", cx, y, {align:"center"});
    y += 6;
    doc.setFont("helvetica","normal"); doc.setFontSize(9); doc.setTextColor(...muted);
    doc.text(`Emitido em ${dados.dataEmissao} às ${dados.horaEmissao}`, cx, y, {align:"center"});

    y += 6;
    doc.setFillColor(...soft); doc.setDrawColor(...line);
    doc.roundedRect(M, y, W-2*M, 20, 3, 3, "FD");
    doc.setFontSize(7.5); doc.setTextColor(...muted);
    doc.text("VALOR PAGO", cx, y+7, {align:"center"});
    doc.setFont("helvetica","bold"); doc.setFontSize(20); doc.setTextColor(...navy);
    doc.text(brl(dados.valor), cx, y+16, {align:"center"});
    y += 30;

    const eyebrow = (txt) => {
      doc.setFont("helvetica","bold"); doc.setFontSize(8); doc.setTextColor(...orange);
      doc.text(txt.toUpperCase(), M, y); y += 5.5;
    };
    const row = (k,v) => {
      doc.setFont("helvetica","normal"); doc.setFontSize(9.5); doc.setTextColor(...muted);
      doc.text(k, M, y);
      doc.setFont("helvetica","bold"); doc.setTextColor(...navy);
      doc.text(String(v ?? "—"), W-M, y, {align:"right"});
      y += 3.5;
      doc.setDrawColor(...line); doc.setLineWidth(0.2); doc.line(M, y, W-M, y);
      y += 5.5;
    };

    eyebrow("Pagador");
    row("Nome", dados.nomePagador);
    row("E-mail", dados.emailPagador);
    if (temTel) row("Telefone", dados.telefonePagador);

    eyebrow("Pagamento");
    row("Forma", dados.formaPagamento || "—");
    if (ehCartao(dados)) row("Cartão", linhaCartao(dados));
    row("Data do pagamento", dados.dataPagamento);

    eyebrow("Assinatura");
    row("Plano", dados.plano);
    row("Nº da fatura", dados.numeroFatura);
    row("Vencimento", dados.dataVencimento);

    y += 3;
    doc.setFont("helvetica","normal"); doc.setFontSize(9); doc.setTextColor(...navy);
    doc.text("Dúvidas? ", cx-11, y, {align:"right"});
    doc.setTextColor(...orange); doc.setFont("helvetica","bold");
    doc.text("suporte@logrotas.com.br", cx-11, y, {align:"left"});
    y += 6;
    doc.setFont("helvetica","normal"); doc.setFontSize(7.5); doc.setTextColor(...muted);
    doc.text("Este documento não possui valor fiscal.", cx, y, {align:"center"});
    y += 4;
    doc.text("© 2026 LogRotas — Sua rota, seu controle", cx, y, {align:"center"});

    doc.save(`comprovante-logrotas-${dados.numeroFatura || "fatura"}.pdf`);
  }

  function gerarComprovanteDeFatura(f) {
    f = f || {};
    const agora = new Date();
    gerarComprovantePDF({
      nomePagador: (f.comprador && f.comprador.nome) || "",
      emailPagador: (f.comprador && f.comprador.email) || "",
      telefonePagador: "",
      formaPagamento: f.formaPagamento || "",
      bandeira: f.bandeira || "",
      ultimos4: f.ultimos4 || "",
      plano: f.descricao || "",
      numeroFatura: f.numeroFatura || "",
      valor: f.valor || 0,
      dataPagamento: fmtData(f.dataPagamento || agora),
      dataVencimento: fmtData(f.vencimento),
      dataEmissao: fmtData(agora),
      horaEmissao: fmtHora(agora),
    });
  }

  window.gerarComprovantePDF = gerarComprovantePDF;
  window.gerarComprovanteDeFatura = gerarComprovanteDeFatura;
})();
