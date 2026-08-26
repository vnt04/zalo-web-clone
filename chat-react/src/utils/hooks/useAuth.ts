import { useContext, useEffect, useState } from 'react';
import { getAuthUser } from '../api';
import { AuthContext } from '../context/AuthContext';

export function useAuth() {
  const [loading, setLoading] = useState(true);
  const { user, updateAuthUser } = useContext(AuthContext);

  useEffect(() => {
    getAuthUser()
      .then(({ data }) => updateAuthUser(data))
      // 401 là trạng thái bình thường (chưa đăng nhập), không phải lỗi cần báo.
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  return { user, loading };
}
