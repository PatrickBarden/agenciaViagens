alter table "public"."financeiro" add column "cliente_id" uuid null;

alter table "public"."financeiro" add constraint "financeiro_cliente_id_fkey" foreign key (cliente_id) references clientes (id) on delete set null;