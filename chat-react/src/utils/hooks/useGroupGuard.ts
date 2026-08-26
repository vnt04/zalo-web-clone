import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchGroupById } from '../api';

export function useGroupGuard() {
  const { id } = useParams();
  // Khởi tạo true: nếu false thì guard render children một nhịp trước khi biết
  // người dùng có phải thành viên nhóm hay không.
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState();

  useEffect(() => {
    setLoading(true);
    fetchGroupById(parseInt(id!))
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  }, [id]);

  return { loading, error };
}
