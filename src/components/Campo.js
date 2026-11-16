// Campo de formulário: label acima, dica ou erro abaixo, ligados por aria-describedby
export default function Campo({ id, label, erro, dica, as: Tag = 'input', children, className, ...props }) {
  const descricao = erro ? `${id}-erro` : dica ? `${id}-dica` : undefined;
  return (
    <div className={className ? `campo ${className}` : 'campo'}>
      <label htmlFor={id}>{label}</label>
      <Tag id={id} name={id} aria-invalid={erro ? true : undefined} aria-describedby={descricao} {...props}>
        {children}
      </Tag>
      {erro ? <small id={`${id}-erro`} className="erro">{erro}</small> : dica && <small id={`${id}-dica`}>{dica}</small>}
    </div>
  );
}
