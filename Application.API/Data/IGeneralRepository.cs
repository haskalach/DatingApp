using System.Collections.Generic;
using System.Threading.Tasks;
using Application.API.Models;

namespace Application.API.Data {
    public interface IGeneralRepository {
        void Add<T> (T entity) where T : class;
        void Delete<T> (T entity) where T : class;
        Task<bool> SaveAll();
        Task<IEnumerable<User>> GetUsers();
        Task<User> GetUser(int id);
    }
}