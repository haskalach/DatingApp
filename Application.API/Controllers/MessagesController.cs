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
    [Authorize]
    [Route ("api/users/[controller]")]
    [ApiController]
    public class MessagesController : ControllerBase {
        private readonly IGeneralRepository _repo;
        private readonly IMapper _mapper;
        public MessagesController (IGeneralRepository repo, IMapper mapper) {
            _mapper = mapper;
            _repo = repo;

        }

        [HttpGet ("{id}", Name = "GetMessage")]
        public async Task<IActionResult> GetMessage (int id) {
            var currenUserId = int.Parse (User.FindFirst (ClaimTypes.NameIdentifier).Value);
            var messageFromRepo = await _repo.GetMessage (id);
            if (messageFromRepo == null) {
                return NotFound ();
            }
            // var messageToReturn = _mapper.Map<MessageToReturnDto> (messageFromRepo);
            return Ok (messageFromRepo);
        }

        [HttpGet]
        public async Task<IActionResult> GetMessagesForUSer ([FromQuery] MessageParams messageParams) {
            var currenUserId = int.Parse (User.FindFirst (ClaimTypes.NameIdentifier).Value);
            messageParams.UserId = currenUserId;
            var messagesFromRepo = await _repo.GetMessagesForUser (messageParams);
            var messages = _mapper.Map<IEnumerable<MessageToReturnDto>> (messagesFromRepo);
            Response.AddPagination (messagesFromRepo.CurrentPage, messagesFromRepo.PageSize, messagesFromRepo.TotalCount, messagesFromRepo.TotalPages);
            return Ok (messages);
        }

        [HttpGet ("thread/{recipientId}")]
        public async Task<IActionResult> GetMessageThread (int recipientId) {
            var userId = int.Parse (User.FindFirst (ClaimTypes.NameIdentifier).Value);
            var messageFromRepo = await _repo.GetMessageThread (userId, recipientId);
            var messageThread = _mapper.Map<IEnumerable<MessageToReturnDto>> (messageFromRepo);
            return Ok (messageThread);
        }

        [HttpPost]
        public async Task<IActionResult> CreateMessage (MessageForCreationDto messageForCreationDto) {
            var userId = int.Parse (User.FindFirst (ClaimTypes.NameIdentifier).Value);
            messageForCreationDto.SenderId = userId;
            var recipient = await _repo.GetUser (messageForCreationDto.RecipientId);
            var sender = await _repo.GetUser (messageForCreationDto.SenderId);
            if (recipient == null) {
                return BadRequest ("Could not Find User");
            }
            var message = _mapper.Map<Message> (messageForCreationDto);
            _repo.Add (message);

            if (await _repo.SaveAll ()) {
                var messageToReturn = _mapper.Map<MessageToReturnDto> (message);
                // return Ok (messageToReturn);
                return CreatedAtRoute ("GetMessage", new { id = message.Id }, messageToReturn);
            }
            throw new Exception ("Creating the message failed on save");
        }

        [HttpPost ("{id}")]
        public async Task<IActionResult> DeleteMessage (int id) {
            var userId = int.Parse (User.FindFirst (ClaimTypes.NameIdentifier).Value);
            var messageFromRepo = await _repo.GetMessage (id);
            if (messageFromRepo.SenderId == userId) {
                messageFromRepo.SenderDeleted = true;
            }
            if (messageFromRepo.RecipientId == userId) {
                messageFromRepo.RecipientDeleted = true;
            }
            if (messageFromRepo.RecipientDeleted && messageFromRepo.SenderDeleted) {
                _repo.Delete (messageFromRepo);
            }
            if (await _repo.SaveAll ())
                return NoContent ();
            throw new Exception ("Error Deleting Message");
        }

        [HttpPost ("{id}/read")]
        public async Task<IActionResult> MarkMessageAsRead (int id) {
            var userId = int.Parse (User.FindFirst (ClaimTypes.NameIdentifier).Value);
            var message = await _repo.GetMessage (id);
            if (message.RecipientId != userId) {
                return Unauthorized ();
            }
            message.IsRead = true;
            message.DateRead = DateTime.Now;

            await _repo.SaveAll ();
            return NoContent ();
        }
    }
}