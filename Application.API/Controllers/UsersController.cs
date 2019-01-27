using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using Application.API.Data;
using Application.API.Dtos;
using Application.API.Helpers;
using Application.API.Models;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Application.API.Controllers {
    [ServiceFilter (typeof (LogUserActivity))]
    [Route ("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase {
        private readonly IGeneralRepository _repo;
        private readonly IMapper _mapper;
        public UsersController (IGeneralRepository repo, IMapper mapper) {
            _mapper = mapper;
            _repo = repo;
        }

        [HttpGet]
        public async Task<IActionResult> GetUsers ([FromQuery] UserParams userParams) {
            var currenUserId = int.Parse (User.FindFirst (ClaimTypes.NameIdentifier).Value);
            var userFromRepo = await _repo.GetUser (currenUserId);
            userParams.UserId = currenUserId;
            if (string.IsNullOrEmpty (userParams.Gender)) {
                userParams.Gender = userFromRepo.Gender == "male" ? "female" : "male";
            }
            var users = await _repo.GetUsers (userParams);
            var usersToReturn = _mapper.Map<IEnumerable<UserForListDto>> (users);
            Response.AddPagination (users.CurrentPage, users.PageSize, users.TotalCount, users.TotalPages);
            return Ok (usersToReturn);
        }

        [HttpGet ("{id}", Name = "GetUser")]
        public async Task<IActionResult> GetUser (int id) {
            var user = await _repo.GetUser (id);
            var userToReturn = _mapper.Map<UserForDetailedDto> (user);
            return Ok (userToReturn);
        }

        [HttpPut]
        public async Task<IActionResult> UpdateUser (UserForUpdateDto userForUpdateDto) {
            // if (id != int.Parse (User.FindFirst (ClaimTypes.NameIdentifier).Value)) {
            //     return Unauthorized ();
            // }
            var userId = int.Parse (User.FindFirst (ClaimTypes.NameIdentifier).Value);
            var userFromRepo = await _repo.GetUser (userId);
            _mapper.Map (userForUpdateDto, userFromRepo);
            if (await _repo.SaveAll ()) {
                return NoContent ();
            }
            throw new Exception ($"Updating user {userId} failed on save");
        }

        [HttpPost ("like/{recipientId}")]
        public async Task<IActionResult> LikeUser (int recipientId) {
            var userId = int.Parse (User.FindFirst (ClaimTypes.NameIdentifier).Value);
            var userFromRepo = await _repo.GetUser (userId);
            var like = await _repo.GetLike (userId, recipientId);
            if (like != null) {
                return BadRequest ("You Already liked this user");
            }
            if (await _repo.GetUser (recipientId) == null) {
                return NotFound ();
            }
            like = new Like {
                LikerId = userId,
                LikeeId = recipientId
            };
            _repo.Add<Like> (like);
            if (await _repo.SaveAll ()) {
                return Ok ();
            }
            return BadRequest ("Not Able to Like user");
        }

    }
}