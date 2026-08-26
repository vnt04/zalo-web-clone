import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getConversationById } from '../api';

export function useConversationGuard() {
  const { id } = useParams();
  // Khởi tạo true: nếu false thì guard render children một nhịp trước khi biết
  // người dùng có quyền vào hội thoại hay không.
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState();

  useEffect(() => {
    setLoading(true);
    getConversationById(parseInt(id!))
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  }, [id]);

  return { loading, error };
}
