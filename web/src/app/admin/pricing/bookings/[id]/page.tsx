import Link from "next/link";
import { format } from "date-fns";
import { notFound } from "next/navigation";
import { decryptBookingPersonalFields } from "@/lib/personal-data/booking-storage";
import { prisma } from "@/lib/prisma";
import { BookingAdminPanel } from "./BookingAdminPanel";

export default async function PricingBookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      property: { include: { group: true } },
    },
  });
  if (!booking) notFound();

  const guest = decryptBookingPersonalFields({
    guestName: booking.guestName,
    guestPhone: booking.guestPhone,
    guestEmail: booking.guestEmail,
  });

  const documents = await prisma.documentGeneration.findMany({
    where: { bookingId: id },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  return (
    <div className="space-y-6">
      <Link href="/admin/pricing/bookings" className="text-sm text-slate-600 underline">
        ← Все заявки
      </Link>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h1 className="font-[family-name:var(--font-display)] text-xl text-slate-900">
            {booking.property.publicName}
          </h1>
          <p className="text-sm text-slate-500">{booking.property.internalCode}</p>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Заезд</dt>
              <dd>{format(booking.dateCheckIn, "dd.MM.yyyy")}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Выезд</dt>
              <dd>{format(booking.dateCheckOut, "dd.MM.yyyy")}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Гостей</dt>
              <dd>{booking.guestsCount}</dd>
            </div>
            <div className="flex justify-between gap-4 border-t border-slate-100 pt-2 font-medium">
              <dt className="text-slate-500">Сумма</dt>
              <dd>{booking.totalPrice.toLocaleString("ru-RU")} ₽</dd>
            </div>
          </dl>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="font-medium text-slate-900">Гость (расшифровано для админки)</h2>
          <p className="mt-1 text-xs text-slate-500">Доступ только авторизованным сотрудникам</p>
          <dl className="mt-4 space-y-2 text-sm">
            <div>
              <dt className="text-slate-500">ФИО</dt>
              <dd className="font-medium">{guest.guestName}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Телефон</dt>
              <dd>{guest.guestPhone}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Email</dt>
              <dd>{guest.guestEmail}</dd>
            </div>
            {booking.comment ? (
              <div>
                <dt className="text-slate-500">Комментарий</dt>
                <dd className="text-slate-700">{booking.comment}</dd>
              </div>
            ) : null}
          </dl>
        </section>
      </div>

      <BookingAdminPanel bookingId={booking.id} currentStatus={booking.status} />

      {documents.length > 0 ? (
        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="font-medium text-slate-900">История документов</h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            {documents.map((d) => (
              <li key={d.id}>
                {d.documentType} · {format(d.createdAt, "dd.MM.yyyy HH:mm")} · {d.aiProvider}
                {d.piiSentToAi ? " · ⚠" : " · без ПДн в ИИ"}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
