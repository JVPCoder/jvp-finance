import * as AlertDialog from '@radix-ui/react-alert-dialog';

// Diálogo de confirmação no lugar do window.confirm. Radix cuida do foco, Esc e aria; o visual é do App.css.
// pedido: { titulo, texto, acao, perigo, onConfirmar } ou null (fechado)
export default function Confirmar({ pedido, onFechar }) {
  return (
    <AlertDialog.Root open={Boolean(pedido)} onOpenChange={(aberto) => !aberto && onFechar()}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="dialogo-fundo" />
        {pedido && (
          <AlertDialog.Content className="dialogo">
            <AlertDialog.Title className="dialogo-titulo">{pedido.titulo}</AlertDialog.Title>
            <AlertDialog.Description className="dialogo-texto">{pedido.texto}</AlertDialog.Description>
            <div className="acoes dialogo-acoes">
              <AlertDialog.Cancel className="btn">Cancelar</AlertDialog.Cancel>
              <AlertDialog.Action className={`btn ${pedido.perigo ? 'perigo-cheio' : 'primario'}`} onClick={pedido.onConfirmar}>
                {pedido.acao}
              </AlertDialog.Action>
            </div>
          </AlertDialog.Content>
        )}
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
