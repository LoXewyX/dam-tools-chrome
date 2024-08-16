import { signal, useSignalEffect } from '@preact/signals';
import { IHomework } from '../interfaces/Homework';
import Loading from '../templates/Loading';

const loading = signal(true);
const homeworkData = signal<IHomework[] | null>(null);

const parseDate = (dateString: string): Date => {
  const [day, month, year] = dateString.split('/').map(Number);
  return new Date(year + 2000, month - 1, day);
};

const Homework: React.FC = () => {
  useSignalEffect(() => {
    fetch('https://api.loxewyx.com/drive/homework')
      .then(async (res) => {
        const data = (await res.json()) as IHomework[];
        data.sort((a, b) => parseDate(a.date).getTime() - parseDate(b.date).getTime());
        console.log(data);
        homeworkData.value = data;
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        loading.value = false;
      });
  });

  let lastDate: string | null = null;

  return loading.value ? (
    <Loading className="mt-5" />
  ) : (
    <div className="container">
      <div className="row">
        {homeworkData.value!.map((item, index) => {
          const showDate = lastDate !== item.date;
          lastDate = item.date;

          return (
            <div className="mt-2" key={index}>
              {showDate && (
                <h6 className="card-subtitle mt-4 text-muted">{item.date}</h6>
              )}
              <div className="card mt-2">
                <div className="card-header">
                  <b>{item.uf}</b> {item.head}
                </div>
                <div className="card-body">
                  <p className="card-text">{item.body}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Homework;
