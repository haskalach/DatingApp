using System.Collections.Generic;
using System.Threading.Tasks;
using Application.API.Helpers;
using Application.API.Models;

namespace Application.API.Data {
    public interface IGeneralRepository {
        void Add<T> (T entity) where T : class;
        void Delete<T> (T entity) where T : class;
        Task<bool> SaveAll ();
        Task<PagedList<User>> GetUsers (UserParams userParams);
        Task<User> GetUser (int id);
        Task<Photo> GetPhoto (int id);
        Task<Photo> GetMainPhoto(int userId);
        Task<Like> GetLike(int userId, int recipientId);
    }
}